import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';

import { Screen, Card, Button, StatusBadge, EmptyState } from '@/components/ui';
import { colors, formatINR, formatDate } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { applicationsApi, type Application } from '@/lib/api';

export default function ApplicationsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await applicationsApi.mine();
      setApps(d.applications);
    } catch {
      setApps([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh whenever the tab regains focus (after payment, etc.)
  useFocusEffect(
    useCallback(() => {
      if (user) load();
    }, [user, load])
  );

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;

  if (!user) {
    return (
      <Screen>
        <EmptyState
          icon="🔐"
          title="Login to see your forms"
          subtitle="Track applications, view receipts and get status updates."
        />
        <View style={styles.cta}>
          <Button title="Login / Sign Up" onPress={() => router.push('/login')} />
        </View>
      </Screen>
    );
  }

  const renderItem = ({ item }: { item: Application }) => {
    const paid = item.payment?.status === 'SUCCESS';
    return (
      <PressableCard onPress={() => router.push(`/applications-detail/${item.id}`)}>
        <Card style={styles.appCard}>
          <View style={styles.appHeader}>
            <Text style={[styles.appTitle, { color: text }]} numberOfLines={1}>
              {item.exam.title}
            </Text>
            <StatusBadge status={item.status} />
          </View>
          <Text style={[styles.appMeta, { color: muted }]}>
            Applied {formatDate(item.createdAt)} · {item.exam.category}
          </Text>
          <View style={styles.appFooter}>
            <Text style={[styles.appFee, { color: text }]}>
              {paid ? `Paid ${formatINR(item.payment?.amount ?? 0)}` : `Pay ${formatINR(item.exam.officialFee + item.exam.serviceFee)}`}
            </Text>
            <Text style={styles.viewText}>View →</Text>
          </View>
        </Card>
      </PressableCard>
    );
  };

  return (
    <Screen>
      <FlatList
        data={apps}
        keyExtractor={(a) => a.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          loading ? (
            <Text style={[styles.loadingText, { color: muted }]}>Loading your applications…</Text>
          ) : null
        }
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="📭"
              title="No applications yet"
              subtitle="Browse forms and apply — we'll track everything here."
            />
          )
        }
      />
    </Screen>
  );
}

function PressableCard({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 32, gap: 10 },
  appCard: { gap: 6 },
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  appTitle: { flex: 1, fontSize: 15, fontWeight: '700' },
  appMeta: { fontSize: 12 },
  appFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  appFee: { fontSize: 14, fontWeight: '800' },
  viewText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  loadingText: { textAlign: 'center', marginTop: 24 },
  cta: { paddingHorizontal: 16 },
});
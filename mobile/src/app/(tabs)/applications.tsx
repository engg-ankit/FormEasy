import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { Screen, Card, Button, StatusBadge, EmptyState } from '@/components/ui';
import { colors, formatINR, formatDate, radius, spacing } from '@/constants/theme';
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

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;
  const cardBg = isDark ? colors.dark.card : colors.card;
  const border = isDark ? colors.dark.border : colors.border;

  if (!user) {
    return (
      <Screen>
        <View style={styles.centerBlock}>
          <View style={[styles.loginIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="lock-closed-outline" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.loginTitle, { color: text }]}>Login to see your forms</Text>
          <Text style={[styles.loginSubtitle, { color: muted }]}>
            Track applications, view receipts and get status updates.
          </Text>
          <Button title="Login / Sign Up" onPress={() => router.push('/login')} style={styles.wide} />
        </View>
      </Screen>
    );
  }

  const renderItem = ({ item }: { item: Application }) => {
    const paid = item.payment?.status === 'SUCCESS';
    const daysAgo = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    return (
      <Pressable onPress={() => router.push(`/applications-detail/${item.id}`)}>
        <Card style={[styles.appCard, { backgroundColor: cardBg, borderColor: border }]}>
          <View style={styles.appHeader}>
            <View style={styles.appHeaderLeft}>
              <Text style={[styles.appTitle, { color: text }]} numberOfLines={2}>
                {item.exam.title}
              </Text>
              <Text style={[styles.appCategory, { color: muted }]}>
                {item.exam.category} • Applied {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
              </Text>
            </View>
            <StatusBadge status={item.status} />
          </View>

          <View style={[styles.appDivider, { backgroundColor: border }]} />

          <View style={styles.appFooter}>
            <View style={styles.appPayment}>
              <Ionicons
                name={paid ? 'checkmark-circle' : 'time-outline'}
                size={16}
                color={paid ? colors.success : colors.warning}
              />
              <Text style={[styles.paymentText, { color: paid ? colors.success : colors.warning }]}>
                {paid ? `Paid ${formatINR(item.payment?.amount ?? 0)}` : 'Payment pending'}
              </Text>
            </View>
            <View style={styles.viewRow}>
              <Text style={styles.viewText}>View</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </View>
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <Screen>
      {/* Header stats */}
      {apps.length > 0 && (
        <View style={[styles.statsBar, { backgroundColor: cardBg, borderColor: border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: text }]}>{apps.length}</Text>
            <Text style={[styles.statLabel, { color: muted }]}>Total</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {apps.filter((a) => a.status === 'COMPLETED').length}
            </Text>
            <Text style={[styles.statLabel, { color: muted }]}>Completed</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {apps.filter((a) => a.status === 'IN_PROCESS').length}
            </Text>
            <Text style={[styles.statLabel, { color: muted }]}>In Progress</Text>
          </View>
        </View>
      )}

      <FlatList
        data={apps}
        keyExtractor={(a) => a.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: muted }]}>Loading your applications…</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyIconBg, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="document-text-outline" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: text }]}>No applications yet</Text>
              <Text style={[styles.emptySubtitle, { color: muted }]}>
                Browse forms and apply — we'll track everything here.
              </Text>
              <Button title="Browse Forms →" onPress={() => router.push('/forms')} style={styles.emptyButton} />
            </View>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  loginIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loginTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  loginSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  wide: { alignSelf: 'stretch' },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1 },

  // List
  list: { padding: spacing.md, paddingBottom: 32, gap: 10 },

  // App card
  appCard: { borderWidth: 1 },
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  appHeaderLeft: { flex: 1 },
  appTitle: { fontSize: 16, fontWeight: '700' },
  appCategory: { fontSize: 12, marginTop: 4 },
  appDivider: { height: 1, marginVertical: 10 },
  appFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appPayment: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paymentText: { fontSize: 13, fontWeight: '600' },
  viewRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewText: { fontSize: 13, fontWeight: '700', color: colors.primary },

  // Loading
  loadingWrap: { alignItems: 'center', paddingVertical: 48 },
  loadingText: { fontSize: 14, marginTop: 12 },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: 6, marginBottom: 20 },
  emptyButton: { alignSelf: 'stretch' },
});

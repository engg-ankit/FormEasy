import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useRouter } from 'expo-router';

import { Screen, Card, Button, EmptyState } from '@/components/ui';
import { colors, formatDate, formatINR, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { applicationsApi, type Application } from '@/lib/api';

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await applicationsApi.mine();
      setApps(d.applications || []);
    } catch {
      setApps([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) load();
      else setLoading(false);
    }, [user, load])
  );

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;
  const cardBg = isDark ? colors.dark.card : colors.card;
  const border = isDark ? colors.dark.border : colors.border;

  const paidApps = apps.filter((a) => a.payment?.status === 'SUCCESS');
  const pendingApps = apps.filter((a) => a.payment?.status === 'PENDING');
  const totalSpent = paidApps.reduce((s, a) => s + (a.payment?.amount ?? 0), 0);

  if (!user) {
    return (
      <Screen>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.primary} />
          <Text style={[styles.centerTitle, { color: text }]}>Login required</Text>
          <Text style={[styles.centerSub, { color: muted }]}>
            Login to see your payment history.
          </Text>
          <Button title="Go to Profile → Login" onPress={() => router.push('/profile')} style={styles.wide} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />
        }
      >
        <Text style={[styles.pageTitle, { color: text }]}>Payment History</Text>

        {/* Summary cards (web parity) */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={[styles.summaryLabel, { color: muted }]}>Total Spent</Text>
            <Text style={[styles.summaryValue, { color: text }]}>{formatINR(totalSpent)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={[styles.summaryLabel, { color: muted }]}>Successful</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>{paidApps.length}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={[styles.summaryLabel, { color: muted }]}>Pending</Text>
            <Text style={[styles.summaryValue, { color: colors.warning }]}>{pendingApps.length}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 32 }} />
        ) : paidApps.length === 0 ? (
          <EmptyState
            icon="💳"
            title="No payments yet"
            subtitle="Your payment history will appear here after your first transaction."
          />
        ) : (
          <View style={styles.list}>
            {paidApps.map((app) => (
              <Card key={app.id} style={[styles.payCard, { backgroundColor: cardBg, borderColor: border }]}>
                <View style={[styles.payIconBg, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <View style={styles.payMeta}>
                  <Text style={[styles.payTitle, { color: text }]} numberOfLines={1}>
                    {app.exam.title}
                  </Text>
                  <Text style={[styles.payDate, { color: muted }]}>{formatDate(app.updatedAt)}</Text>
                </View>
                <View style={styles.payRight}>
                  <Text style={[styles.payAmount, { color: text }]}>{formatINR(app.payment?.amount ?? 0)}</Text>
                  <Text style={[styles.payStatus, { color: colors.success }]}>Paid ✓</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, paddingBottom: 40, gap: 14 },
  pageTitle: { fontSize: 24, fontWeight: '900' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  centerTitle: { fontSize: 20, fontWeight: '800' },
  centerSub: { fontSize: 14, textAlign: 'center' },
  wide: { alignSelf: 'stretch' },

  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  summaryLabel: { fontSize: 11, fontWeight: '700' },
  summaryValue: { fontSize: 20, fontWeight: '900' },

  list: { gap: 10 },
  payCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1 },
  payIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payMeta: { flex: 1, minWidth: 0 },
  payTitle: { fontSize: 15, fontWeight: '700' },
  payDate: { fontSize: 12, marginTop: 2 },
  payRight: { alignItems: 'flex-end' },
  payAmount: { fontSize: 15, fontWeight: '800' },
  payStatus: { fontSize: 12, fontWeight: '700', marginTop: 2 },
});

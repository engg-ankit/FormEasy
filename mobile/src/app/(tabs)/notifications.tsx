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
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { Screen, Card, Button, EmptyState } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { notificationsApi, type UserNotification } from '@/lib/api';

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  INFO: { icon: 'information-circle', color: colors.info },
  SUCCESS: { icon: 'checkmark-circle', color: colors.success },
  WARNING: { icon: 'warning', color: colors.warning },
  ERROR: { icon: 'close-circle', color: colors.danger },
  PAYMENT: { icon: 'wallet', color: colors.success },
  APPLICATION: { icon: 'document-text', color: colors.primary },
  FORM_REQUEST: { icon: 'document-attach', color: colors.accent },
};

function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const diff = now - new Date(dateString).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const d = await notificationsApi.list();
      setNotifications(d.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    } finally {
      setMarking(false);
    }
  };

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;
  const cardBg = isDark ? colors.dark.card : colors.card;
  const border = isDark ? colors.dark.border : colors.border;

  const renderItem = ({ item }: { item: UserNotification }) => {
    const config = TYPE_CONFIG[item.type?.toUpperCase?.()] || TYPE_CONFIG.INFO || {
      icon: 'notifications',
      color: colors.primary,
    };

    return (
      <Card
        style={[
          styles.notificationCard,
          {
            backgroundColor: cardBg,
            borderColor: item.isRead ? border : `${config.color}30`,
            borderLeftWidth: item.isRead ? 1 : 3,
          },
        ]}
      >
        <View style={styles.notificationHeader}>
          <View style={[styles.iconBg, { backgroundColor: `${config.color}15` }]}>
            <Ionicons name={config.icon as any} size={18} color={config.color} />
          </View>
          <View style={styles.notificationMeta}>
            <Text style={[styles.notificationTitle, { color: text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.notificationTime, { color: muted }]}>
              {formatTimeAgo(item.createdAt)}
            </Text>
          </View>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={[styles.notificationBody, { color: muted }]} numberOfLines={3}>
          {item.body}
        </Text>
      </Card>
    );
  };

  if (!user) {
    return (
      <Screen edges={[]}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.primary} />
          <Text style={[styles.centerTitle, { color: text }]}>Login to see updates</Text>
          <Text style={[styles.centerSub, { color: muted }]}>
            Form status updates aur payment confirmations yahan dikhenge.
          </Text>
        </View>
      </Screen>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Screen edges={[]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: text }]}>Notifications</Text>
        {unreadCount > 0 && (
          <Pressable onPress={markAllRead} disabled={marking} hitSlop={8}>
            <Text style={[styles.unreadCount, { color: colors.primary, fontWeight: '700' }]}>
              {marking ? 'Marking…' : `Mark all read (${unreadCount})`}
            </Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 40 }} />
          ) : (
            <EmptyState
              icon="🔔"
              title="No notifications"
              subtitle="You're all caught up! We'll notify you about form updates."
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  unreadCount: { fontSize: 13, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  centerTitle: { fontSize: 20, fontWeight: '800' },
  centerSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  list: { paddingHorizontal: spacing.md, paddingBottom: 32, gap: 10 },
  notificationCard: { borderWidth: 1 },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationMeta: { flex: 1 },
  notificationTitle: { fontSize: 15, fontWeight: '700' },
  notificationTime: { fontSize: 12, marginTop: 1 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notificationBody: { fontSize: 13, lineHeight: 18 },
});

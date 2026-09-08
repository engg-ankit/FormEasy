import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { Screen, Card, EmptyState } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

// Mock data - in real app this would come from an API
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Form Submitted Successfully',
    body: 'Your JEE Main application has been submitted. Our team will process it within 24 hours.',
    type: 'success',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    title: 'Payment Confirmed',
    body: 'Payment of ₹1,250 for GATE 2024 form has been received successfully.',
    type: 'success',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    title: 'Document Verification',
    body: 'Your uploaded documents are being verified. We will notify you once verified.',
    type: 'info',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '4',
    title: 'Form Deadline Approaching',
    body: 'NEET 2024 registration closes in 3 days. Apply now before it\'s too late!',
    type: 'warning',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

const TYPE_CONFIG = {
  info: { icon: 'information-circle', color: colors.info },
  success: { icon: 'checkmark-circle', color: colors.success },
  warning: { icon: 'warning', color: colors.warning },
  error: { icon: 'close-circle', color: colors.danger },
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
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    // In real app, fetch from API
    setNotifications(MOCK_NOTIFICATIONS);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;
  const cardBg = isDark ? colors.dark.card : colors.card;
  const border = isDark ? colors.dark.border : colors.border;

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const config = TYPE_CONFIG[item.type];

    return (
      <Card
        style={[
          styles.notificationCard,
          {
            backgroundColor: cardBg,
            borderColor: item.read ? border : `${config.color}30`,
            borderLeftWidth: item.read ? 1 : 3,
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
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={[styles.notificationBody, { color: muted }]} numberOfLines={3}>
          {item.body}
        </Text>
      </Card>
    );
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: text }]}>Notifications</Text>
        {notifications.some((n) => !n.read) && (
          <Text style={[styles.unreadCount, { color: colors.primary }]}>
            {notifications.filter((n) => !n.read).length} unread
          </Text>
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
          <EmptyState
            icon="🔔"
            title="No notifications"
            subtitle="You're all caught up! We'll notify you about form updates."
          />
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

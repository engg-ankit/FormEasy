import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';

export interface DrawerItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

/**
 * Web app ke sidebar (MobileMenu drawer) jaisa menu — same items, mobile UX.
 * Hamburger button + slide-in drawer with header, nav items, footer.
 */
export function useDrawer() {
  const [open, setOpen] = React.useState(false);
  const openDrawer = React.useCallback(() => setOpen(true), []);
  const closeDrawer = React.useCallback(() => setOpen(false), []);
  return { open, openDrawer, closeDrawer, setOpen };
}

export function DrawerMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  const slide = useRef(new Animated.Value(-320)).current;
  const fade = useRef(new Animated.Value(0)).current;

  const text = isDark ? colors.dark.text : colors.text;
  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const cardBg = isDark ? colors.dark.card : colors.card;
  const border = isDark ? colors.dark.border : colors.border;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(slide, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [open, slide, fade]);

  const close = () => {
    Animated.parallel([
      Animated.timing(slide, { toValue: -320, duration: 220, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const go = (fn: () => void) => {
    close();
    // Wait for the close animation before navigating
    setTimeout(fn, 240);
  };

  const items: DrawerItem[] = user
    ? [
        { icon: 'home', label: 'Dashboard', onPress: () => router.push('/(tabs)') },
        { icon: 'search', label: 'Browse Forms', onPress: () => router.push('/(tabs)/forms') },
        { icon: 'add-circle', label: 'Request Form', onPress: () => router.push('/request-form') },
        { icon: 'document-text', label: 'My Applications', onPress: () => router.push('/(tabs)/applications') },
        { icon: 'card', label: 'Payment History', onPress: () => router.push('/payment-history') },
        { icon: 'gift', label: 'Refer & Earn', onPress: () => router.push('/(tabs)/profile') },
        { icon: 'notifications', label: 'Notifications', onPress: () => router.push('/(tabs)/notifications') },
        { icon: 'person', label: 'Profile', onPress: () => router.push('/(tabs)/profile') },
        { icon: 'call', label: 'Contact Support', onPress: () => router.push('/(tabs)/profile') },
        { icon: 'log-out', label: 'Logout', onPress: () => logout(), danger: true },
      ]
    : [
        { icon: 'search', label: 'Browse Forms', onPress: () => router.push('/(tabs)/forms') },
        { icon: 'log-in', label: 'Login', onPress: () => router.push('/login') },
        { icon: 'person-add', label: 'Sign Up', onPress: () => router.push('/signup') },
        { icon: 'call', label: 'Contact', onPress: () => router.push('/(tabs)/profile') },
      ];

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={close}>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={styles.backdropTouch} onPress={close} />
      </Animated.View>
      <Animated.View
        style={[
          styles.drawer,
          { backgroundColor: cardBg, transform: [{ translateX: slide }] },
        ]}
      >
        {/* Header — brand + user (web drawer jaisa) */}
        <View style={[styles.header, { borderBottomColor: border }]}>
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandCursor}>➤</Text>
              <View style={styles.brandDot} />
            </View>
            <Text style={[styles.brandName, { color: text }]}>ClickNsit</Text>
          </View>
          {user ? (
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(user.fullName || 'U')[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.userName, { color: text }]} numberOfLines={1}>
                  {user.fullName}
                </Text>
                <Text style={[styles.userEmail, { color: muted }]} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.userEmail, { color: muted }]}>Welcome! Login to get started.</Text>
          )}
        </View>

        {/* Nav items */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.navList}>
          {items.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => go(item.onPress)}
              style={({ pressed }) => [
                styles.navItem,
                pressed && { backgroundColor: isDark ? '#333' : colors.primaryLight },
              ]}
            >
              <View
                style={[
                  styles.navIconBg,
                  { backgroundColor: item.danger ? '#fee2e2' : `${item.danger ? colors.danger : colors.primary}15` },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={item.danger ? colors.danger : colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.navLabel,
                  { color: item.danger ? colors.danger : text },
                ]}
              >
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={muted} />
            </Pressable>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: border }]}>
          <Text style={[styles.footerText, { color: muted }]}>
            Click. Sit. Done. 🎯
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdropTouch: { flex: 1 },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 300,
    maxWidth: '82%',
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: spacing.md,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  brandCursor: { color: '#fff', fontSize: 13, marginTop: -2 },
  brandDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent },
  brandName: { fontSize: 20, fontWeight: '900' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  userName: { fontSize: 14, fontWeight: '800' },
  userEmail: { fontSize: 12 },
  navList: { paddingVertical: 10, paddingHorizontal: 10, gap: 2 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    minHeight: 48,
  },
  navIconBg: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: { flex: 1, fontSize: 15, fontWeight: '700' },
  footer: {
    borderTopWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  footerText: { fontSize: 12, fontWeight: '600' },
});

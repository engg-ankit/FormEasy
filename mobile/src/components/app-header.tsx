import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DrawerMenu, useDrawer } from '@/components/drawer-menu';

/**
 * Web app ke navy header (bg-primary-900) jaisa bar — brand left, hamburger right.
 * Status-bar inset khud handle karta hai.
 */
export function AppHeader({
  onMenu,
  title,
}: {
  onMenu: () => void;
  title?: string;
}) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const bg = isDark ? colors.dark.header : colors.header;

  return (
    <View style={[styles.wrap, { backgroundColor: bg, paddingTop: insets.top + 6 }]}>
      <View style={styles.row}>
        <View style={styles.brandCol}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandCursor}>➤</Text>
            <View style={styles.brandDot} />
          </View>
          <Text style={styles.brandText}>{title || 'ClickNsit'}</Text>
        </View>
        <Pressable
          onPress={onMenu}
          hitSlop={12}
          style={({ pressed }) => [styles.menuBtn, pressed && { backgroundColor: 'rgba(255,255,255,0.12)' }]}
          accessibilityLabel="Open menu"
        >
          <Ionicons name="menu" size={26} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Tab screens ka shell — navy header + drawer + content.
 * Screen ka top inset AppHeader handle karta hai, isliye content Screen edges=[] ke saath.
 */
export function TabShell({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const drawer = useDrawer();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader onMenu={drawer.openDrawer} title={title} />
      <DrawerMenu open={drawer.open} onClose={drawer.closeDrawer} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  brandCol: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  brandCursor: { color: '#fff', fontSize: 12, marginTop: -2 },
  brandDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent },
  brandText: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

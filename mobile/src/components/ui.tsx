import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { colors, radius, statusInfo } from '@/constants/theme';

export function Screen({
  children,
  style,
  scroll,
  edges = ['top'] as const,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scroll?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}) {
  const { isDark } = useTheme();
  return (
    <SafeAreaView
      edges={edges as any}
      style={[
        styles.screen,
        { backgroundColor: isDark ? colors.dark.background : colors.background },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'accent';

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { isDark } = useTheme();
  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: '#ffffff' },
    accent: { bg: colors.accent, fg: '#ffffff' },
    outline: {
      bg: 'transparent',
      fg: isDark ? '#c7d2fe' : colors.primary,
      border: isDark ? colors.dark.border : colors.primary,
    },
    ghost: { bg: 'transparent', fg: isDark ? colors.dark.textMuted : colors.textMuted },
  };
  const p = palette[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: p.bg,
          borderColor: p.border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <Text style={[styles.buttonText, { color: p.fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  const { isDark } = useTheme();
  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const border = isDark ? colors.dark.border : colors.border;
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: muted }]}>{label}</Text>
      <TextInput
        placeholderTextColor={muted}
        style={[
          styles.input,
          {
            color: isDark ? colors.dark.text : colors.text,
            backgroundColor: isDark ? colors.dark.card : colors.card,
            borderColor: error ? colors.danger : border,
          },
        ]}
        {...props}
      />
      {!!error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const info = statusInfo(status);
  return (
    <View style={[styles.badge, { backgroundColor: info.bg }]}>
      <Text style={[styles.badgeText, { color: info.fg }]}>{info.label}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { isDark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.dark.card : colors.card,
          borderColor: isDark ? colors.dark.border : colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) {
  const { isDark } = useTheme();
  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={[styles.emptyTitle, { color: isDark ? colors.dark.text : colors.text }]}>{title}</Text>
      {!!subtitle && <Text style={[styles.emptySubtitle, { color: muted }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  fieldError: { color: colors.danger, fontSize: 12, marginTop: 4 },
  input: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 16,
  },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 4, lineHeight: 20 },
});
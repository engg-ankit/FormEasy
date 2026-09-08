import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen, Button, Field } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;

  const submit = async () => {
    if (!email || !password) return;
    setBusy(true);
    try {
      await login(email.trim(), password);
      router.back();
    } catch (e) {
      Alert.alert('Login failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={[styles.title, { color: text }]}>Welcome back 👋</Text>
        <Text style={[styles.subtitle, { color: muted }]}>Login to track forms, pay and download documents.</Text>

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          placeholder="••••••••"
        />

        <Button title={busy ? 'Logging in…' : 'Login'} loading={busy} onPress={submit} />

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: muted }]} />
          <Text style={[styles.dividerText, { color: muted }]}>OR</Text>
          <View style={[styles.dividerLine, { backgroundColor: muted }]} />
        </View>

        {/* OTP Login Button */}
        <Button
          title="📱 Login with OTP"
          variant="outline"
          onPress={() => router.push('/otp-login')}
        />

        <Text style={[styles.footer, { color: muted }]}>
          New to ClickNsit?{' '}
          <Text style={styles.link} onPress={() => router.replace('/signup')}>
            Create an account
          </Text>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 24, gap: 6 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, marginBottom: 18, lineHeight: 20 },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontWeight: '600' },

  footer: { textAlign: 'center', marginTop: 14, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '700' },
});

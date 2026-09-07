import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen, Button, Field } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';

export default function SignupScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Required';
    if (!/^\d{10}$/.test(mobile)) e.mobile = '10-digit mobile number';
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Valid email required';
    if (password.length < 6) e.password = 'At least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      await signup({
        fullName: fullName.trim(),
        mobile,
        email: email.trim().toLowerCase(),
        password,
        referralCode: referralCode.trim() || undefined,
      });
      router.dismissAll();
      router.replace('/');
    } catch (e) {
      Alert.alert('Signup failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: isDark ? colors.dark.text : colors.text }]}>Create your account 🚀</Text>
        <Text style={[styles.subtitle, { color: muted }]}>
          Fill forms from home — our team submits them on official portals.
        </Text>

        <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="As per Aadhaar" error={errors.fullName} />
        <Field label="Mobile number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" maxLength={10} placeholder="10-digit mobile" error={errors.mobile} />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" error={errors.email} />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Minimum 6 characters" error={errors.password} />
        <Field label="Referral code (optional)" value={referralCode} onChangeText={setReferralCode} autoCapitalize="characters" placeholder="e.g. FE1234" />

        <Button title={busy ? 'Creating account…' : 'Sign Up — it’s free'} loading={busy} onPress={submit} />

        <Text style={[styles.footer, { color: muted }]}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => router.replace('/login')}>
            Login
          </Text>
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, marginBottom: 18, lineHeight: 20 },
  footer: { textAlign: 'center', marginTop: 14, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '700' },
});
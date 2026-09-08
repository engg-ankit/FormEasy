import React, { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Button, Field } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { otpApi, authApi } from '@/lib/api';

type Step = 'email' | 'otp';

export default function OtpLoginScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { loginWithToken } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const otpRefs = useRef<(TextInput | null)[]>([]);

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;
  const cardBg = isDark ? colors.dark.card : colors.card;
  const border = isDark ? colors.dark.border : colors.border;

  // Send OTP to email
  const sendOtp = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors({ email: 'Enter valid email address' });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const res = await otpApi.send(email, 'LOGIN');
      if (res.success) {
        setStep('otp');
        setCooldown(30);
        // Start cooldown timer
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        Alert.alert('OTP Sent! 📧', `OTP sent to ${email}. Valid for 5 minutes.`);
      }
    } catch (e) {
      Alert.alert('Failed', e instanceof Error ? e.message : 'Could not send OTP. Try again.');
    } finally {
      setBusy(false);
    }
  };

  // Verify OTP & Login
  const verifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrors({ otp: 'Enter complete 6-digit OTP' });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const res = await authApi.otpLogin(email, otpString);
      if (res.success && res.token) {
        await loginWithToken(res.token);
        router.dismissAll();
        router.replace('/');
      }
    } catch (e) {
      Alert.alert('Login Failed', e instanceof Error ? e.message : 'Invalid OTP. Try again.');
    } finally {
      setBusy(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Paste handling
      const digits = text.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (text && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={text} />
          </Pressable>

          {step === 'email' ? (
            <>
              <Text style={[styles.title, { color: text }]}>
                Login with OTP 🔐
              </Text>
              <Text style={[styles.subtitle, { color: muted }]}>
                Enter your registered email. We'll send a 6-digit OTP.
              </Text>

              <View style={[styles.emailInput, { backgroundColor: cardBg, borderColor: errors.email ? colors.danger : border }]}>
                <Ionicons name="mail-outline" size={20} color={muted} />
                <TextInput
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setErrors({});
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="you@example.com"
                  placeholderTextColor={muted}
                  style={[styles.emailField, { color: text }]}
                  autoFocus
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <Button
                title={busy ? 'Sending OTP…' : 'Send OTP →'}
                loading={busy}
                onPress={sendOtp}
                style={styles.button}
              />
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: text }]}>
                Enter OTP 🔢
              </Text>
              <Text style={[styles.subtitle, { color: muted }]}>
                6-digit code sent to {email}
              </Text>

              {/* OTP Input Boxes */}
              <View style={styles.otpRow}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(ref) => { otpRefs.current[i] = ref; }}
                    value={digit}
                    onChangeText={(t) => handleOtpChange(t, i)}
                    onKeyPress={(e) => handleKeyPress(e, i)}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={[
                      styles.otpBox,
                      {
                        backgroundColor: cardBg,
                        borderColor: digit ? colors.primary : border,
                        color: text,
                      },
                    ]}
                    autoFocus={i === 0}
                    selectTextOnFocus
                  />
                ))}
              </View>
              {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}

              <Button
                title={busy ? 'Verifying…' : 'Verify & Login →'}
                loading={busy}
                onPress={verifyOtp}
                style={styles.button}
              />

              {/* Resend OTP */}
              <View style={styles.resendRow}>
                {cooldown > 0 ? (
                  <Text style={[styles.cooldownText, { color: muted }]}>
                    Resend OTP in {cooldown}s
                  </Text>
                ) : (
                  <Pressable onPress={sendOtp} disabled={busy}>
                    <Text style={[styles.resendText, { color: colors.primary }]}>
                      Resend OTP
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Change email */}
              <Pressable onPress={() => { setStep('email'); setOtp(['', '', '', '', '', '']); }}>
                <Text style={[styles.changeEmail, { color: muted }]}>
                  ← Change email
                </Text>
              </Pressable>
            </>
          )}

          <Text style={[styles.footer, { color: muted }]}>
            New to ClickNsit?{' '}
            <Text style={styles.link} onPress={() => router.replace('/signup')}>
              Create an account
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { padding: 24, paddingBottom: 48, gap: 6 },
  backBtn: { marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, marginBottom: 24, lineHeight: 20 },

  // Email input
  emailInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    minHeight: 56,
    gap: 10,
  },
  emailField: { flex: 1, fontSize: 16, fontWeight: '600' },

  // OTP input
  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginVertical: 16 },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
  },

  // Button
  button: { marginTop: 8 },

  // Resend
  resendRow: { alignItems: 'center', marginTop: 16 },
  cooldownText: { fontSize: 14 },
  resendText: { fontSize: 14, fontWeight: '700' },

  // Change email
  changeEmail: { fontSize: 14, textAlign: 'center', marginTop: 12 },

  // Error
  errorText: { color: colors.danger, fontSize: 13, marginTop: 4 },

  // Footer
  footer: { textAlign: 'center', marginTop: 24, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '700' },
});

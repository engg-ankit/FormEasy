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
import { otpApi } from '@/lib/api';

type Step = 'email' | 'otp' | 'details';

export default function SignupScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { signup } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 3 fields
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const otpRefs = useRef<(TextInput | null)[]>([]);

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;
  const cardBg = isDark ? colors.dark.card : colors.card;
  const border = isDark ? colors.dark.border : colors.border;

  // Step 1: Send OTP to email
  const sendOtp = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors({ email: 'Enter valid email address' });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const res = await otpApi.send(email, 'SIGNUP');
      if (res.success) {
        setStep('otp');
        setCooldown(30);
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) { clearInterval(timer); return 0; }
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

  // Step 2: Verify OTP
  const verifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrors({ otp: 'Enter complete 6-digit OTP' });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const res = await otpApi.verify(email, otpString, 'SIGNUP');
      if (res.success) {
        setStep('details');
      }
    } catch (e) {
      Alert.alert('Verification Failed', e instanceof Error ? e.message : 'Invalid OTP. Try again.');
    } finally {
      setBusy(false);
    }
  };

  // Step 3: Create account
  const createAccount = async () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Required';
    if (!/^\d{10}$/.test(mobile)) e.mobile = 'Valid 10-digit mobile required';
    if (password.length < 6) e.password = 'At least 6 characters';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

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
    } catch (err) {
      Alert.alert('Signup failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
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

  // Step indicator
  const getStepNumber = (s: Step) => {
    const steps: Step[] = ['email', 'otp', 'details'];
    return steps.indexOf(s) + 1;
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
          {step !== 'email' && (
            <Pressable onPress={() => {
              if (step === 'otp') setStep('email');
              if (step === 'details') setStep('otp');
            }} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={text} />
            </Pressable>
          )}

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            {(['email', 'otp', 'details'] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <View style={[
                  styles.stepDot,
                  getStepNumber(step) >= getStepNumber(s) && styles.stepDotActive,
                ]}>
                  <Text style={styles.stepDotText}>{getStepNumber(s)}</Text>
                </View>
                {i < 2 && <View style={[styles.stepLine, getStepNumber(step) > getStepNumber(s) && styles.stepLineActive]} />}
              </React.Fragment>
            ))}
          </View>

          {/* ===== STEP 1: Email ===== */}
          {step === 'email' && (
            <>
              <Text style={[styles.title, { color: text }]}>Create account 🚀</Text>
              <Text style={[styles.subtitle, { color: muted }]}>
                Enter your email — we'll send an OTP to verify it. It's FREE!
              </Text>

              <View style={[styles.emailInput, { backgroundColor: cardBg, borderColor: errors.email ? colors.danger : border }]}>
                <Ionicons name="mail-outline" size={20} color={muted} />
                <TextInput
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrors({}); }}
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

              <Button title={busy ? 'Sending OTP…' : 'Send OTP →'} loading={busy} onPress={sendOtp} style={styles.button} />

              <Text style={[styles.footer, { color: muted }]}>
                Already have an account?{' '}
                <Text style={styles.link} onPress={() => router.replace('/login')}>Login</Text>
              </Text>
            </>
          )}

          {/* ===== STEP 2: OTP Verification ===== */}
          {step === 'otp' && (
            <>
              <Text style={[styles.title, { color: text }]}>Verify OTP 🔢</Text>
              <Text style={[styles.subtitle, { color: muted }]}>
                6-digit code sent to {email}
              </Text>

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
                    style={[styles.otpBox, { backgroundColor: cardBg, borderColor: digit ? colors.primary : border, color: text }]}
                    autoFocus={i === 0}
                    selectTextOnFocus
                  />
                ))}
              </View>
              {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}

              <Button title={busy ? 'Verifying…' : 'Verify →'} loading={busy} onPress={verifyOtp} style={styles.button} />

              <View style={styles.resendRow}>
                {cooldown > 0 ? (
                  <Text style={[styles.cooldownText, { color: muted }]}>Resend OTP in {cooldown}s</Text>
                ) : (
                  <Pressable onPress={sendOtp} disabled={busy}>
                    <Text style={[styles.resendText, { color: colors.primary }]}>Resend OTP</Text>
                  </Pressable>
                )}
              </View>

              <Pressable onPress={() => { setStep('email'); setOtp(['', '', '', '', '', '']); }}>
                <Text style={[styles.changeEmail, { color: muted }]}>← Change email</Text>
              </Pressable>
            </>
          )}

          {/* ===== STEP 3: Account Details ===== */}
          {step === 'details' && (
            <>
              <Text style={[styles.title, { color: text }]}>Your details ✨</Text>
              <Text style={[styles.subtitle, { color: muted }]}>
                Email verified! Fill in the rest to complete your account.
              </Text>

              <View style={[styles.verifiedBadge, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={[styles.verifiedText, { color: colors.success }]}>{email} verified ✓</Text>
              </View>

              <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="As per Aadhaar" error={errors.fullName} />
              <Field label="Mobile number" value={mobile} onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))} keyboardType="phone-pad" placeholder="9876543210" error={errors.mobile} />
              <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Minimum 6 characters" error={errors.password} />
              <Field label="Referral code (optional)" value={referralCode} onChangeText={setReferralCode} autoCapitalize="characters" placeholder="e.g. FE1234" />

              <Button title={busy ? 'Creating account…' : 'Sign Up — it\'s free'} loading={busy} onPress={createAccount} style={styles.button} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { padding: 24, paddingBottom: 48, gap: 6 },
  backBtn: { marginBottom: 16 },

  // Step indicator
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  stepLine: { flex: 1, height: 3, backgroundColor: colors.border, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: colors.primary },

  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, marginBottom: 20, lineHeight: 20 },

  // Email input
  emailInput: {
    flexDirection: 'row', alignItems: 'center', borderRadius: radius.md,
    borderWidth: 1, paddingHorizontal: 14, minHeight: 56, gap: 10,
  },
  emailField: { flex: 1, fontSize: 16, fontWeight: '600' },

  // OTP
  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginVertical: 16 },
  otpBox: {
    width: 48, height: 56, borderRadius: radius.md,
    borderWidth: 2, textAlign: 'center', fontSize: 24, fontWeight: '800',
  },

  // Verified badge
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.md, marginBottom: 16,
  },
  verifiedText: { fontSize: 14, fontWeight: '700' },

  // Button
  button: { marginTop: 8 },

  // Resend
  resendRow: { alignItems: 'center', marginTop: 16 },
  cooldownText: { fontSize: 14 },
  resendText: { fontSize: 14, fontWeight: '700' },
  changeEmail: { fontSize: 14, textAlign: 'center', marginTop: 12 },

  // Error
  errorText: { color: colors.danger, fontSize: 13, marginTop: 4 },

  // Footer
  footer: { textAlign: 'center', marginTop: 24, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '700' },
});

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, Button } from '@/components/ui';
import { colors, formatINR, radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { paymentApi } from '@/lib/api';
import { openRazorpayCheckout } from '@/lib/razorpay';

type Phase = 'loading' | 'ready' | 'paying' | 'verifying' | 'success' | 'failed';

export default function PaymentScreen() {
  const { applicationId } = useLocalSearchParams<{ applicationId: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [phase, setPhase] = useState<Phase>('loading');
  const [order, setOrder] = useState<{ id: string; amount: number } | null>(null);
  const [keyId, setKeyId] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;

  const createOrder = useCallback(async () => {
    setPhase('loading');
    try {
      const res = await paymentApi.createOrder(applicationId!);
      setOrder(res.order);
      setKeyId(res.keyId);
      setExamTitle(res.exam.title);
      setPhase('ready');
    } catch (e) {
      setPhase('failed');
      setErrorMsg(e instanceof Error ? e.message : 'Could not start payment');
    }
  }, [applicationId]);

  useEffect(() => {
    createOrder();
  }, [createOrder]);

  const pay = async () => {
    if (!order) return;
    setPhase('paying');
    try {
      const result = await openRazorpayCheckout({
        key: keyId,
        amount: order.amount,
        order_id: order.id,
        name: 'ClickNsit',
        description: examTitle,
        prefill: {
          name: user?.fullName,
          email: user?.email,
          contact: user?.mobile,
        },
        theme: { color: colors.primary },
      });

      // Verify on the server
      setPhase('verifying');
      await paymentApi.verify({
        applicationId: applicationId!,
        razorpayOrderId: result.razorpay_order_id,
        razorpayPaymentId: result.razorpay_payment_id,
        razorpaySignature: result.razorpay_signature,
      });
      setPhase('success');
    } catch (e) {
      // user cancelled, network error, or native module missing (Expo Go)
      setPhase('ready');
      const message =
        e instanceof Error && /native module|not available|Expo Go/i.test(e.message)
          ? 'Razorpay needs a development build. Run the app with `npx expo run:android` (not Expo Go) to pay.'
          : 'Payment was cancelled or failed. Please try again.';
      Alert.alert('Payment incomplete', message);
    }
  };

  const success = phase === 'success';

  return (
    <Screen>
      <View style={styles.body}>
        {success ? (
          <View style={styles.centerBlock}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={48} color="#ffffff" />
            </View>
            <Text style={[styles.successTitle, { color: text }]}>Payment Successful 🎉</Text>
            <Text style={[styles.successSub, { color: muted }]}>
              {formatINR(order?.amount ?? 0)} paid{examTitle ? ` for ${examTitle}` : ''}.{'\n'}
              Our team will now fill and submit your form. Track it under My Forms.
            </Text>
            <Button title="Track My Forms" onPress={() => router.replace('/applications')} />
          </View>
        ) : (
          <Card style={styles.card}>
            <Text style={[styles.examTitle, { color: text }]}>{examTitle || 'Application'}</Text>
            <View style={styles.feeRow}>
              <Text style={[styles.feeLabel, { color: muted }]}>Amount to pay</Text>
              <Text style={[styles.feeValue, { color: text }]}>{formatINR(order?.amount ?? 0)}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={[styles.feeLabel, { color: muted }]}>Gateway</Text>
              <Text style={[styles.feeValue, { color: text }]}>Razorpay (secure)</Text>
            </View>
            <View style={styles.secureRow}>
              <Ionicons name="lock-closed" size={13} color={colors.success} />
              <Text style={[styles.secureText, { color: muted }]}>
                256-bit encrypted · UPI, cards & netbanking
              </Text>
            </View>
          </Card>
        )}

        {!success && (
          <>
            <Button
              title={phase === 'paying' || phase === 'verifying' ? 'Processing…' : 'Pay Now'}
              loading={phase === 'paying' || phase === 'verifying' || phase === 'loading'}
              disabled={phase === 'failed'}
              onPress={pay}
            />
            {phase === 'failed' && (
              <>
                <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
                <Button title="Retry" variant="ghost" onPress={createOrder} />
              </>
            )}
            <Text style={[styles.note, { color: muted }]}>
              Official fee goes directly to the government — the small service fee covers our expert form filling.
            </Text>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 12 },
  card: { gap: 8, marginBottom: 4 },
  examTitle: { fontSize: 18, fontWeight: '800' },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feeLabel: { fontSize: 14 },
  feeValue: { fontSize: 15, fontWeight: '800' },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  secureText: { fontSize: 12 },
  note: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 },
  errorText: { fontSize: 14, textAlign: 'center' },
  centerBlock: { alignItems: 'center', paddingTop: 48, gap: 14 },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { fontSize: 22, fontWeight: '800' },
  successSub: { fontSize: 14, textAlign: 'center', lineHeight: 21, paddingHorizontal: 8 },
});
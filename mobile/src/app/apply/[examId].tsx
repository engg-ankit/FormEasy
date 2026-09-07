import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { Screen, Card, Button, Field } from '@/components/ui';
import { API_URL, applicationsApi, examsApi, getAuthToken, type Exam } from '@/lib/api';
import { colors, formatINR, radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';

interface UploadedDoc {
  type: string;
  label: string;
  uri: string;
}

const DOC_FIELDS: { type: string; label: string }[] = [
  { type: 'PHOTO', label: 'Passport photo' },
  { type: 'SIGNATURE', label: 'Signature' },
  { type: 'ID_PROOF', label: 'ID proof (Aadhaar/PAN)' },
];

async function uploadDoc(doc: UploadedDoc): Promise<string> {
  const form = new FormData();
  const ext = doc.uri.split('.').pop()?.toLowerCase() || 'jpg';
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  form.append('file', { uri: doc.uri, name: `doc-${doc.type}.${ext}`, type: mime } as unknown as Blob);
  form.append('docType', doc.type);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getAuthToken() ?? ''}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.fileUrl as string;
}

export default function ApplyScreen() {
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 fields
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  // Step 2 docs
  const [docs, setDocs] = useState<Record<string, UploadedDoc>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load exam + prefill from profile
  React.useEffect(() => {
    if (examId) examsApi.detail(examId).then((d) => setExam(d.exam)).catch(() => {});
    if (user) {
      setFullName(user.fullName || '');
      setMobile(user.mobile || '');
      setEmail(user.email || '');
    }
  }, [examId, user]);

  const total = useMemo(() => (exam ? exam.officialFee + exam.serviceFee : 0), [exam]);

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;

  const pickImage = async (type: string, label: string) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to upload your documents.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
      setDocs((prev) => ({ ...prev, [type]: { type, label, uri: result.assets[0].uri } }));
    }
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!/^\d{10}$/.test(mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email';
    if (!dob) e.dob = 'Date of birth is required (DD-MM-YYYY)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      // Upload each doc
      const documents: { type: string; url: string }[] = [];
      for (const d of Object.values(docs)) {
        const url = await uploadDoc(d);
        documents.push({ type: d.type, url });
      }

      const formPayload = {
        fullName: fullName.trim(),
        mobile,
        email: email.trim().toLowerCase(),
        dob,
        gender,
        documents,
      };

      const { applicationId } = await applicationsApi.create(examId!, formPayload, total);
      router.replace(`/payment/${applicationId}`);
    } catch (err) {
      Alert.alert('Submission failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ['Your Details', 'Documents', 'Review & Pay'];

  return (
    <Screen>
      <View style={styles.stepsHeader}>
        {steps.map((label, i) => (
          <View key={label} style={styles.stepWrap}>
            <View style={[styles.stepDot, i === step ? styles.stepDotActive : i < step ? styles.stepDotDone : null]}>
              <Text style={styles.stepDotText}>{i < step ? '✓' : i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, { color: muted }, i === step && { color: text, fontWeight: '700' }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <Card style={styles.card}>
            <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="As per Aadhaar" error={errors.fullName} />
            <Field label="Mobile number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" maxLength={10} placeholder="10-digit mobile" error={errors.mobile} />
            <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" error={errors.email} />
            <Field label="Date of birth (DD-MM-YYYY)" value={dob} onChangeText={setDob} placeholder="01-01-2000" error={errors.dob} />
            <Field label="Gender" value={gender} onChangeText={setGender} placeholder="Male / Female / Other" />
          </Card>
        )}

        {step === 1 && (
          <Card style={styles.card}>
            <Text style={[styles.hint, { color: muted }]}>
              Upload clear, readable documents. Our team fills the official form using these.
            </Text>
            {DOC_FIELDS.map((f) => {
              const doc = docs[f.type];
              return (
                <Pressable key={f.type} onPress={() => pickImage(f.type, f.label)} style={styles.docRow}>
                  {doc ? (
                    <Image source={{ uri: doc.uri }} style={styles.docPreview} />
                  ) : (
                    <View style={[styles.docPlaceholder, { borderColor: isDark ? colors.dark.border : colors.border }]}>
                      <Text style={styles.docPlus}>＋</Text>
                    </View>
                  )}
                  <View style={styles.docInfo}>
                    <Text style={[styles.docLabel, { color: text }]}>{f.label}</Text>
                    <Text style={[styles.docState, { color: muted }]}>{doc ? '✓ Uploaded' : 'Tap to upload'}</Text>
                  </View>
                  {doc && (
                    <Pressable
                      onPress={() =>
                        setDocs((prev) => {
                          const next = { ...prev };
                          delete next[f.type];
                          return next;
                        })
                      }
                      hitSlop={10}
                    >
                      <Text style={styles.docRemove}>Remove</Text>
                    </Pressable>
                  )}
                </Pressable>
              );
            })}
          </Card>
        )}

        {step === 2 && exam && (
          <>
            <Card style={styles.card}>
              <Text style={[styles.examTitle, { color: text }]}>{exam.title}</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: muted }]}>Name</Text>
                <Text style={[styles.summaryValue, { color: text }]}>{fullName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: muted }]}>Mobile</Text>
                <Text style={[styles.summaryValue, { color: text }]}>{mobile}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: muted }]}>Documents</Text>
                <Text style={[styles.summaryValue, { color: text }]}>{Object.keys(docs).length}/3 uploaded</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: muted }]}>Official fee</Text>
                <Text style={[styles.summaryValue, { color: text }]}>{formatINR(exam.officialFee)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: muted }]}>Service fee</Text>
                <Text style={[styles.summaryValue, { color: text }]}>{formatINR(exam.serviceFee)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: text, fontWeight: '800' }]}>Total</Text>
                <Text style={[styles.summaryValue, { color: text, fontWeight: '800' }]}>{formatINR(total)}</Text>
              </View>
            </Card>
            <Text style={[styles.note, { color: muted }]}>
              💳 Pay securely via Razorpay (UPI, cards, netbanking). We start processing once payment is confirmed.
            </Text>
          </>
        )}

        <View style={styles.navRow}>
          {step > 0 && <Button title="← Back" variant="ghost" onPress={() => setStep(step - 1)} style={styles.navBack} />}
          {step < 2 ? (
            <Button
              title="Continue →"
              onPress={() => (step === 0 ? validateStep1() && setStep(1) : setStep(2))}
              style={styles.navNext}
            />
          ) : (
            <Button
              title={submitting ? 'Submitting…' : `Submit & Pay ${formatINR(total)}`}
              loading={submitting}
              onPress={submit}
              style={styles.navNext}
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepsHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  stepWrap: { alignItems: 'center', flex: 1, gap: 4 },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotDone: { backgroundColor: colors.success },
  stepDotText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  stepLabel: { fontSize: 10, textAlign: 'center' },
  body: { padding: 16, paddingBottom: 40 },
  card: { gap: 4, marginBottom: 16 },
  hint: { fontSize: 13, lineHeight: 19, marginBottom: 8 },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  docPreview: { width: 52, height: 52, borderRadius: radius.sm },
  docPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docPlus: { fontSize: 20, color: colors.primary },
  docInfo: { flex: 1 },
  docLabel: { fontSize: 14, fontWeight: '700' },
  docState: { fontSize: 12, marginTop: 2 },
  docRemove: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  examTitle: { fontSize: 17, fontWeight: '800', marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
  note: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  navRow: { flexDirection: 'row', gap: 10 },
  navBack: { flex: 1 },
  navNext: { flex: 2 },
});
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { Screen, Card, Button } from '@/components/ui';
import { colors, formatDate, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { formRequestsApi, type FormRequest } from '@/lib/api';

const CATEGORIES = [
  'Government Exam',
  'College Admission',
  'Scholarship',
  'University Registration',
  'Passport',
  'Driving License',
  'Property Registration',
  'Income Tax',
  'GST Registration',
  'Other',
];

const STATUS_META: Record<string, { color: string; bg: string }> = {
  PENDING: { color: '#a16207', bg: '#fef9c3' },
  APPROVED: { color: '#15803d', bg: '#dcfce7' },
  DECLINED: { color: '#b91c1c', bg: '#fee2e2' },
  COMPLETED: { color: '#1d4ed8', bg: '#dbeafe' },
};

export default function RequestFormScreen() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [requests, setRequests] = useState<FormRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    formName: '',
    category: '',
    portalName: '',
    description: '',
    contactNumber: user?.mobile || '',
  });

  const load = useCallback(async () => {
    try {
      const d = await formRequestsApi.list();
      setRequests(d.requests || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) load();
    }, [user, load])
  );

  const submit = async () => {
    if (!form.formName || !form.category || !form.contactNumber) {
      Alert.alert('Missing info', 'Form name, category and contact number are required.');
      return;
    }
    setSubmitting(true);
    try {
      await formRequestsApi.create(form);
      Alert.alert('Request sent! 🎉', 'We will review it and get back to you soon.');
      setForm({
        formName: '',
        category: '',
        portalName: '',
        description: '',
        contactNumber: user?.mobile || '',
      });
      setShowForm(false);
      load();
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;
  const cardBg = isDark ? colors.dark.card : colors.card;
  const border = isDark ? colors.dark.border : colors.border;

  if (!user) {
    return (
      <Screen>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.primary} />
          <Text style={[styles.centerTitle, { color: text }]}>Login required</Text>
          <Text style={[styles.centerSub, { color: muted }]}>
            Request a form feature needs an account.
          </Text>
          <Button title="Go to Profile → Login" onPress={() => {}} style={styles.wide} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHead}>
          <Text style={[styles.pageTitle, { color: text }]}>Request a Form</Text>
          <Text style={[styles.pageSub, { color: muted }]}>
            Can't find the form you need? Tell us — we'll add it for you!
          </Text>
        </View>

        {!showForm && (
          <Button
            title="＋  Request New Form"
            onPress={() => setShowForm(true)}
            style={styles.wide}
          />
        )}

        {showForm && (
          <Card style={[styles.formCard, { backgroundColor: cardBg, borderColor: colors.primary }]}>
            <View style={styles.formHead}>
              <Ionicons name="document-text" size={18} color={colors.primary} />
              <Text style={[styles.formTitle, { color: text }]}>New Form Request</Text>
              <Pressable onPress={() => setShowForm(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={muted} />
              </Pressable>
            </View>

            <Text style={[styles.label, { color: muted }]}>Form/Exam Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.dark.background : '#fff', borderColor: border, color: text }]}
              placeholder="e.g., Delhi University Admission 2025"
              placeholderTextColor={muted}
              value={form.formName}
              onChangeText={(v) => setForm({ ...form, formName: v })}
            />

            <Text style={[styles.label, { color: muted }]}>Category *</Text>
            <View style={styles.chipsWrap}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setForm({ ...form, category: c })}
                  style={[
                    styles.chip,
                    { borderColor: border },
                    form.category === c && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.chipText, { color: muted }, form.category === c && { color: '#fff' }]}>
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: muted }]}>Official Portal (if known)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.dark.background : '#fff', borderColor: border, color: text }]}
              placeholder="e.g., admission.du.ac.in"
              placeholderTextColor={muted}
              value={form.portalName}
              onChangeText={(v) => setForm({ ...form, portalName: v })}
            />

            <Text style={[styles.label, { color: muted }]}>Additional Details</Text>
            <TextInput
              style={[
                styles.input,
                styles.textarea,
                { backgroundColor: isDark ? colors.dark.background : '#fff', borderColor: border, color: text },
              ]}
              placeholder="Deadline, requirements, etc."
              placeholderTextColor={muted}
              multiline
              numberOfLines={3}
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
            />

            <Text style={[styles.label, { color: muted }]}>Contact Number *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.dark.background : '#fff', borderColor: border, color: text }]}
              placeholder="Your phone number"
              placeholderTextColor={muted}
              keyboardType="phone-pad"
              maxLength={10}
              value={form.contactNumber}
              onChangeText={(v) => setForm({ ...form, contactNumber: v })}
            />

            <Button
              title={submitting ? 'Submitting…' : 'Submit Request'}
              onPress={submit}
              disabled={submitting}
              loading={submitting}
              style={styles.wide}
            />
          </Card>
        )}

        {/* My Requests */}
        <View style={styles.sectionHead}>
          <Ionicons name="time" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: text }]}>My Requests</Text>
          {requests.length > 0 && (
            <View style={[styles.countPill, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.countText, { color: colors.primary }]}>{requests.length}</Text>
            </View>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
        ) : requests.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: border }]}>
            <Ionicons name="file-tray-outline" size={40} color={muted} />
            <Text style={[styles.emptyTitle, { color: text }]}>No requests yet</Text>
            <Text style={[styles.emptySub, { color: muted }]}>
              Tap "Request New Form" to get started
            </Text>
          </Card>
        ) : (
          requests.map((req) => {
            const meta = STATUS_META[req.status] || { color: muted, bg: isDark ? '#333' : '#f3f4f6' };
            return (
              <Card key={req.id} style={[styles.reqCard, { backgroundColor: cardBg, borderColor: border }]}>
                <View style={styles.reqHead}>
                  <Text style={[styles.reqName, { color: text }]} numberOfLines={1}>
                    {req.formName}
                  </Text>
                  <View style={[styles.reqBadge, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.reqBadgeText, { color: meta.color }]}>{req.status}</Text>
                  </View>
                </View>
                <View style={styles.reqMetaRow}>
                  <View style={[styles.catPill, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.catText, { color: colors.primary }]}>{req.category}</Text>
                  </View>
                  <Text style={[styles.reqDate, { color: muted }]}>{formatDate(req.createdAt)}</Text>
                </View>
                {req.portalName ? (
                  <Text style={[styles.reqDesc, { color: muted }]}>Portal: {req.portalName}</Text>
                ) : null}
                {req.adminNote ? (
                  <View style={[styles.adminNote, { backgroundColor: isDark ? '#172554' : '#eff6ff', borderColor: isDark ? '#1e3a8a' : '#bfdbfe' }]}>
                    <Text style={[styles.adminNoteText, { color: isDark ? '#bfdbfe' : '#1e40af' }]}>
                      <Text style={{ fontWeight: '800' }}>Admin Response: </Text>
                      {req.adminNote}
                      {req.estimatedFee ? `\nEstimated Fee: ₹${(req.estimatedFee / 100).toFixed(0)}` : ''}
                    </Text>
                  </View>
                ) : null}
              </Card>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, paddingBottom: 40, gap: 14 },
  pageHead: { gap: 4 },
  pageTitle: { fontSize: 24, fontWeight: '900' },
  pageSub: { fontSize: 14, lineHeight: 20 },
  wide: { alignSelf: 'stretch' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  centerTitle: { fontSize: 20, fontWeight: '800' },
  centerSub: { fontSize: 14, textAlign: 'center' },

  formCard: { borderWidth: 2, gap: 4 },
  formHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  formTitle: { flex: 1, fontSize: 17, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '700', marginTop: 10, marginBottom: 6 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textarea: { minHeight: 84, paddingTop: 12, textAlignVertical: 'top' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: '600' },

  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', flex: 1 },
  countPill: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 999 },
  countText: { fontSize: 12, fontWeight: '800' },

  emptyCard: { alignItems: 'center', padding: 28, gap: 6, borderWidth: 1 },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptySub: { fontSize: 13, textAlign: 'center' },

  reqCard: { gap: 8, borderWidth: 1 },
  reqHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reqName: { flex: 1, fontSize: 15, fontWeight: '800' },
  reqBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  reqBadgeText: { fontSize: 10, fontWeight: '800' },
  reqMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { fontSize: 11, fontWeight: '700' },
  reqDate: { fontSize: 12 },
  reqDesc: { fontSize: 13 },
  adminNote: { borderRadius: radius.md, borderWidth: 1, padding: 10 },
  adminNoteText: { fontSize: 13, lineHeight: 19 },
});

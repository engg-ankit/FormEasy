import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen, Card, Button } from '@/components/ui';
import { colors, formatINR, formatDate, radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { examsApi, type Exam } from '@/lib/api';

export default function ExamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    examsApi
      .detail(id)
      .then((d) => setExam(d.exam))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  if (!exam) {
    return (
      <Screen style={styles.center}>
        <Text style={{ color: muted }}>Form not found.</Text>
      </Screen>
    );
  }

  const daysLeft = Math.ceil((new Date(exam.lastDate).getTime() - Date.now()) / 86400000);
  const total = exam.officialFee + exam.serviceFee;
  const portalUrl = exam.portalUrl ?? null;
  const docs = (exam.requiredDocuments || '')
    .split(/[\n,]+/)
    .map((d) => d.trim())
    .filter(Boolean);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.badgeRow}>
          <Text style={[styles.category, { color: isDark ? colors.dark.textMuted : colors.textMuted }]}>
            {exam.category.toUpperCase()}
          </Text>
          <Text style={[styles.deadline, { color: daysLeft <= 7 ? colors.danger : colors.warning }]}>
            {daysLeft < 0
              ? '⛔ Closed'
              : daysLeft <= 7
                ? `⚠️ Only ${daysLeft} day${daysLeft === 1 ? '' : 's'} left!`
                : `📅 ${daysLeft} days left`}
          </Text>
        </View>

        <Text style={[styles.title, { color: text }]}>{exam.title}</Text>
        <Text style={[styles.desc, { color: muted }]}>{exam.description}</Text>

        <Text style={[styles.lastDate, { color: muted }]}>Last date: {formatDate(exam.lastDate)}</Text>

        {/* Fee breakdown */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: text }]}>Fees</Text>
          <Row label="Official (government) fee" value={formatINR(exam.officialFee)} muted={muted} text={text} />
          <Row label="ClickNsit service fee" value={formatINR(exam.serviceFee)} muted={muted} text={text} />
          <View style={styles.divider} />
          <Row label="Total payable" value={formatINR(total)} muted={muted} text={text} bold />
        </Card>

        {/* Documents */}
        {docs.length > 0 && (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: text }]}>Required Documents</Text>
            {docs.map((doc, i) => (
              <Text key={i} style={[styles.docItem, { color: muted }]}>
                📄 {doc}
              </Text>
            ))}
          </Card>
        )}

        <Text style={[styles.note, { color: muted }]}>
          🔒 You share only basic details — our team fills the official form for you.
        </Text>

        {portalUrl ? (
          <Text onPress={() => Linking.openURL(portalUrl)} style={[styles.portalLink, { color: colors.primary }]}>
            View official portal →
          </Text>
        ) : null}

        <View style={styles.spacer} />
        <Button
          title={daysLeft < 0 ? 'Applications Closed' : `Apply Now · ${formatINR(total)}`}
          disabled={daysLeft < 0}
          onPress={() => router.push(`/apply/${exam.id}`)}
        />
      </ScrollView>
    </Screen>
  );
}

function Row({
  label,
  value,
  muted,
  text,
  bold,
}: {
  label: string;
  value: string;
  muted: string;
  text: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: muted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: text }, bold && styles.rowValueBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  container: { padding: 16, paddingBottom: 40 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  category: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  deadline: { fontSize: 13, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8, lineHeight: 32 },
  desc: { fontSize: 15, lineHeight: 22, marginBottom: 10 },
  lastDate: { fontSize: 13, marginBottom: 16 },
  card: { marginBottom: 14, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 14, flex: 1, paddingRight: 12 },
  rowValue: { fontSize: 14, fontWeight: '600' },
  rowValueBold: { fontSize: 17, fontWeight: '800' },
  divider: { height: 1, backgroundColor: colors.border },
  docItem: { fontSize: 14, lineHeight: 22 },
  note: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  portalLink: { fontSize: 14, fontWeight: '700', marginBottom: 16 },
  spacer: { height: 8 },
});
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen, Card, Button } from '@/components/ui';
import { colors, formatINR, radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { examsApi, type Exam } from '@/lib/api';

const STEPS = [
  { icon: '🔍', title: 'Browse', desc: 'Pick your form' },
  { icon: '✍️', title: 'Fill details', desc: '2 min form' },
  { icon: '📎', title: 'Upload docs', desc: 'Photo + ID' },
  { icon: '✅', title: 'We submit it', desc: 'On the portal' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    examsApi
      .list()
      .then((d) => setExams(d.exams.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: isDark ? colors.dark.card : colors.primaryLight }]}>
          <Text style={[styles.heroTitle, { color: text }]}>
            Your Online Cyber Cafe{'\n'}
            <Text style={styles.heroAccent}>Click. Sit. Done.</Text>
          </Text>
          <Text style={[styles.heroSub, { color: muted }]}>
            Fill exam, college & scholarship forms from home — our team submits them on the official portal.
          </Text>
          <Button title="Browse Exam Forms" onPress={() => router.push('/forms')} />
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>How It Works</Text>
          <View style={styles.stepsRow}>
            {STEPS.map((s) => (
              <View key={s.title} style={styles.step}>
                <Text style={styles.stepIcon}>{s.icon}</Text>
                <Text style={[styles.stepTitle, { color: text }]} numberOfLines={1}>
                  {s.title}
                </Text>
                <Text style={[styles.stepDesc, { color: muted }]} numberOfLines={2}>
                  {s.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Featured forms */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>Popular Forms</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
          ) : (
            exams.map((exam) => (
              <Pressable key={exam.id} onPress={() => router.push(`/exam/${exam.id}`)}>
                <Card style={styles.examCard}>
                  <View style={styles.examHeader}>
                    <Text style={[styles.examCategory, { color: colors.accent }]}>{exam.category}</Text>
                    <Text style={[styles.examFee, { color: text }]}>{formatINR(exam.officialFee + exam.serviceFee)}</Text>
                  </View>
                  <Text style={[styles.examTitle, { color: text }]} numberOfLines={1}>
                    {exam.title}
                  </Text>
                  <Text style={[styles.examDesc, { color: muted }]} numberOfLines={2}>
                    {exam.description}
                  </Text>
                  <Text style={styles.deadline}>
                    📅 Last date:{' '}
                    {new Date(exam.lastDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </Card>
              </Pressable>
            ))
          )}
          <Button title="View all forms →" variant="ghost" onPress={() => router.push('/forms')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  hero: {
    borderRadius: radius.xl,
    padding: 24,
    marginBottom: 24,
    gap: 12,
  },
  heroTitle: { fontSize: 26, fontWeight: '800', lineHeight: 36 },
  heroAccent: { color: colors.primary },
  heroSub: { fontSize: 14, lineHeight: 21 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 14 },
  stepsRow: { flexDirection: 'row', gap: 8 },
  step: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    alignItems: 'center',
  },
  stepIcon: { fontSize: 22, marginBottom: 4 },
  stepTitle: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  stepDesc: { fontSize: 10, textAlign: 'center', marginTop: 2 },
  examCard: { marginBottom: 10 },
  examHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  examCategory: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  examFee: { fontSize: 17, fontWeight: '800' },
  examTitle: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  examDesc: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  deadline: { fontSize: 12, marginTop: 10, color: colors.warning, fontWeight: '600' },
});
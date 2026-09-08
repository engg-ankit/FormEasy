import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, Button } from '@/components/ui';
import { colors, formatINR, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { examsApi, type Exam } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STEPS = [
  { icon: '🔍', title: 'Browse', desc: 'Pick your form', color: '#4f46e5' },
  { icon: '✍️', title: 'Fill details', desc: '2 min form', color: '#7c3aed' },
  { icon: '📎', title: 'Upload docs', desc: 'Photo + ID', color: '#f26338' },
  { icon: '✅', title: 'We submit it', desc: 'On the portal', color: '#16a34a' },
];

const STATS = [
  { value: '5000+', label: 'Students Served', icon: 'people' },
  { value: '10K+', label: 'Forms Filled', icon: 'document-text' },
  { value: '99%', label: 'Success Rate', icon: 'checkmark-circle' },
  { value: '24h', label: 'Quick Turnaround', icon: 'time' },
];

const TESTIMONIALS = [
  {
    name: 'Priya S.',
    college: 'NSIT Delhi',
    text: 'Got my GATE form submitted in 2 minutes! Super smooth process.',
    rating: 5,
  },
  {
    name: 'Rahul M.',
    college: 'DTU',
    text: 'Was confused about JEE Main form — ClickNsit made it so easy!',
    rating: 5,
  },
  {
    name: 'Ananya K.',
    college: 'IIIT Delhi',
    text: 'Applied for 3 scholarship forms. All done from my phone. Amazing!',
    rating: 5,
  },
];

const TRUST_BADGES = [
  { icon: 'shield-checkmark', text: 'Secure & Private' },
  { icon: 'flash', text: 'Fast Processing' },
  { icon: 'headset', text: '24/7 Support' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await examsApi.list();
      setExams(d.exams.slice(0, 5));
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;
  const cardBg = isDark ? colors.dark.card : colors.card;
  const borderColor = isDark ? colors.dark.border : colors.border;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Hero */}
        <LinearGradient colors={[colors.navyDeep, colors.navy]} style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroBrand}>CLICK NSIT</Text>
            <Text style={styles.heroTitle}>Your Online{'\n'}Cyber Cafe</Text>
            <Text style={styles.heroSub}>
              Fill exam, college & scholarship forms from home — our team submits them on the official portal.
            </Text>
            <Text style={styles.heroAccent}>Click. Sit. Done. 🎯</Text>
            <View style={styles.heroButtons}>
              <Button title="Browse Forms →" variant="accent" onPress={() => router.push('/forms')} />
            </View>
          </View>

          {/* Decorative elements */}
          <View style={styles.heroDecor}>
            <View style={[styles.heroDecorCircle, { backgroundColor: 'rgba(79,70,229,0.15)' }]} />
            <View style={[styles.heroDecorCircle2, { backgroundColor: 'rgba(242,99,56,0.1)' }]} />
          </View>
        </LinearGradient>

        {/* Trust Badges */}
        <View style={styles.trustRow}>
          {TRUST_BADGES.map((badge) => (
            <View key={badge.text} style={[styles.trustBadge, { backgroundColor: cardBg, borderColor }]}>
              <Ionicons name={badge.icon as any} size={16} color={colors.primary} />
              <Text style={[styles.trustText, { color: text }]}>{badge.text}</Text>
            </View>
          ))}
        </View>

        {/* Stats Counter */}
        <View style={styles.statsContainer}>
          {STATS.map((stat) => (
            <View key={stat.label} style={[styles.statItem, { backgroundColor: cardBg, borderColor }]}>
              <Ionicons name={stat.icon as any} size={20} color={colors.primary} />
              <Text style={[styles.statValue, { color: text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: muted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: text }]}>How It Works</Text>
            <Text style={[styles.sectionSubtitle, { color: muted }]}>4 simple steps</Text>
          </View>
          <View style={styles.stepsContainer}>
            {STEPS.map((s, i) => (
              <View key={s.title} style={styles.stepWrapper}>
                <View
                  style={[
                    styles.step,
                    {
                      backgroundColor: cardBg,
                      borderColor,
                    },
                  ]}
                >
                  <View style={[styles.stepIconBg, { backgroundColor: `${s.color}15` }]}>
                    <Text style={styles.stepIcon}>{s.icon}</Text>
                  </View>
                  <Text style={[styles.stepTitle, { color: text }]} numberOfLines={1}>
                    {s.title}
                  </Text>
                  <Text style={[styles.stepDesc, { color: muted }]} numberOfLines={2}>
                    {s.desc}
                  </Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[styles.stepArrow, { borderColor }]}>
                    <Ionicons name="chevron-forward" size={14} color={muted} />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Featured forms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: text }]}>Popular Forms</Text>
            <Pressable onPress={() => router.push('/forms')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All →</Text>
            </Pressable>
          </View>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
          ) : (
            exams.map((exam) => (
              <Pressable key={exam.id} onPress={() => router.push(`/exam/${exam.id}`)}>
                <Card style={styles.examCard}>
                  <View style={styles.examHeader}>
                    <View style={styles.examCategoryBadge}>
                      <Text style={styles.examCategory}>{exam.category}</Text>
                    </View>
                    <Text style={[styles.examFee, { color: colors.primary }]}>
                      {formatINR(exam.officialFee + exam.serviceFee)}
                    </Text>
                  </View>
                  <Text style={[styles.examTitle, { color: text }]} numberOfLines={1}>
                    {exam.title}
                  </Text>
                  <Text style={[styles.examDesc, { color: muted }]} numberOfLines={2}>
                    {exam.description}
                  </Text>
                  <View style={styles.examFooter}>
                    <Text style={styles.deadline}>
                      📅{' '}
                      {new Date(exam.lastDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                  </View>
                </Card>
              </Pressable>
            ))
          )}
          <Button title="View All Forms →" variant="ghost" onPress={() => router.push('/forms')} />
        </View>

        {/* Testimonials */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>What Students Say</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsScroll}
          >
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} style={[styles.testimonialCard, { width: SCREEN_WIDTH * 0.75 }]}>
                <View style={styles.testimonialStars}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Text key={i} style={styles.star}>⭐</Text>
                  ))}
                </View>
                <Text style={[styles.testimonialText, { color: text }]}>"{t.text}"</Text>
                <View style={styles.testimonialAuthor}>
                  <View style={[styles.testimonialAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.testimonialAvatarText}>{t.name[0]}</Text>
                  </View>
                  <View>
                    <Text style={[styles.testimonialName, { color: text }]}>{t.name}</Text>
                    <Text style={[styles.testimonialCollege, { color: muted }]}>{t.college}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* CTA */}
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Ready to get started?</Text>
          <Text style={styles.ctaSub}>
            Join 5000+ students who filled their forms from home.
          </Text>
          <Button
            title="Browse Forms Now →"
            variant="accent"
            onPress={() => router.push('/forms')}
            style={styles.ctaButton}
          />
        </LinearGradient>

        <View style={{ height: 32 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 32 },

  // Hero
  hero: {
    margin: spacing.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: 24,
    minHeight: 260,
  },
  heroContent: { zIndex: 2 },
  heroBrand: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#f26338',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: { fontSize: 30, fontWeight: '900', color: '#ffffff', lineHeight: 38, marginBottom: 8 },
  heroSub: { fontSize: 14, lineHeight: 22, color: '#c7d2fe', marginBottom: 8 },
  heroAccent: { fontSize: 17, fontWeight: '800', color: '#fbbf24', marginBottom: 16 },
  heroButtons: { marginTop: 4 },
  heroDecor: { ...StyleSheet.absoluteFill },
  heroDecorCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    right: -40,
    top: -40,
  },
  heroDecorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    right: 40,
    bottom: -30,
  },

  // Trust badges
  trustRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: 8,
    marginBottom: spacing.md,
  },
  trustBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  trustText: { fontSize: 11, fontWeight: '700' },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: 8,
    marginBottom: spacing.lg,
  },
  statItem: {
    width: (SCREEN_WIDTH - 40) / 2,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '600' },

  // Section
  section: { marginBottom: spacing.lg, paddingHorizontal: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  sectionSubtitle: { fontSize: 13, fontWeight: '500' },
  seeAll: { fontSize: 14, fontWeight: '700' },

  // Steps
  stepsContainer: { flexDirection: 'row', alignItems: 'center' },
  stepWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  step: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  stepIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepIcon: { fontSize: 20 },
  stepTitle: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  stepDesc: { fontSize: 9, textAlign: 'center', marginTop: 2 },
  stepArrow: { width: 0, borderLeftWidth: 1 },

  // Exam cards
  examCard: { marginBottom: 10 },
  examHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  examCategoryBadge: {
    backgroundColor: `${colors.accent}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  examCategory: { fontSize: 11, fontWeight: '800', color: colors.accent, textTransform: 'uppercase' },
  examFee: { fontSize: 17, fontWeight: '900' },
  examTitle: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  examDesc: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  examFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  deadline: { fontSize: 12, color: colors.warning, fontWeight: '600' },

  // Testimonials
  testimonialsScroll: { gap: 12 },
  testimonialCard: { padding: 16 },
  testimonialStars: { flexDirection: 'row', gap: 2, marginBottom: 8 },
  star: { fontSize: 12 },
  testimonialText: { fontSize: 14, lineHeight: 21, fontStyle: 'italic', marginBottom: 12 },
  testimonialAuthor: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  testimonialAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialAvatarText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  testimonialName: { fontSize: 13, fontWeight: '700' },
  testimonialCollege: { fontSize: 11 },

  // CTA
  ctaCard: {
    margin: spacing.md,
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: { fontSize: 20, fontWeight: '800', color: '#ffffff', textAlign: 'center' },
  ctaSub: { fontSize: 14, color: '#c7d2fe', textAlign: 'center', marginTop: 6, marginBottom: 16 },
  ctaButton: { alignSelf: 'stretch' },
});

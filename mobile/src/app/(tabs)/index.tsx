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

import { Screen, Card, Button, StatusBadge } from '@/components/ui';
import { colors, formatINR, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { examsApi, applicationsApi, type Exam, type Application } from '@/lib/api';

const { width: SCREEN_WIDTH } = useWindowWidth();
function useWindowWidth() {
  return Dimensions.get('window');
}

const MARKETING_STEPS = [
  { icon: '🔍', title: 'Browse', desc: 'Pick your form', color: '#4f46e5' },
  { icon: '✍️', title: 'Fill details', desc: '2 min form', color: '#7c3aed' },
  { icon: '📎', title: 'Upload docs', desc: 'Photo + ID', color: '#f26338' },
  { icon: '✅', title: 'We submit it', desc: 'On the portal', color: '#16a34a' },
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

const STATUS_STEPS = [
  { status: 'SUBMITTED', label: 'Submitted' },
  { status: 'IN_PROCESS', label: 'In Review' },
  { status: 'FORM_FILLED', label: 'Form Filled' },
  { status: 'COMPLETED', label: 'Completed' },
];

const STATUS_META: Record<string, { color: string; bg: string }> = {
  DRAFT: { color: '#c2410c', bg: '#ffedd5' },
  SUBMITTED: { color: '#1d4ed8', bg: '#dbeafe' },
  IN_PROCESS: { color: '#b45309', bg: '#fef3c7' },
  FORM_FILLED: { color: '#7e22ce', bg: '#f3e8ff' },
  COMPLETED: { color: '#15803d', bg: '#dcfce7' },
  REJECTED: { color: '#b91c1c', bg: '#fee2e2' },
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  IN_PROCESS: 'In Process',
  FORM_FILLED: 'Form Filled',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
};

function getProgress(status: string) {
  const order = ['SUBMITTED', 'IN_PROCESS', 'FORM_FILLED', 'COMPLETED'];
  const idx = order.indexOf(status);
  return idx < 0 ? 0 : ((idx + 1) / order.length) * 100;
}

function daysLeft(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await examsApi.list();
      setExams(d.exams.slice(0, 5));
      if (user) {
        try {
          const a = await applicationsApi.mine();
          setApps(a.applications);
        } catch {
          setApps([]);
        }
      } else {
        setApps([]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

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

  // ---- Stats (web dashboard parity) ----
  const totalApps = apps.length;
  const completedApps = apps.filter((a) => a.status === 'COMPLETED').length;
  const pendingApps = apps.filter((a) => a.status === 'SUBMITTED' || a.status === 'IN_PROCESS').length;
  const totalSpent = apps
    .filter((a) => a.payment?.status === 'SUCCESS')
    .reduce((sum, a) => sum + (a.payment?.amount ?? 0), 0);
  const paidApps = apps.filter((a) => a.payment?.status === 'SUCCESS');

  // Upcoming deadlines (within 30 days, excluding applied exams)
  const appliedExamIds = new Set(apps.map((a) => a.exam?.id));
  const deadlines = exams
    .filter((e) => {
      const dl = daysLeft(e.lastDate);
      return dl > 0 && dl <= 30;
    })
    .sort((a, b) => +new Date(a.lastDate) - +new Date(b.lastDate))
    .slice(0, 3);

  // Marketing content only for guests
  const showMarketing = !user;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* ===== Hero: user dashboard welcome OR guest marketing hero ===== */}
        {user ? (
          <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.hero}>
            <View style={styles.heroContent}>
              <Text style={styles.heroWelcome} numberOfLines={1}>
                Welcome back, {user.fullName?.split(' ')[0]}! 👋
              </Text>
              <Text style={styles.heroSub}>
                Manage your form applications, track progress and more.
              </Text>
              <View style={styles.heroButtons}>
                <Button title="Browse Forms →" variant="accent" onPress={() => router.push('/forms')} />
              </View>
            </View>
          </LinearGradient>
        ) : (
          <LinearGradient colors={[colors.navyDeep, colors.navy]} style={styles.hero}>
            <View style={styles.heroContent}>
              <Text style={styles.heroBrand}>CLICK NSIT</Text>
              <Text style={styles.heroTitle}>
                Your Online{'\n'}Cyber Cafe
              </Text>
              <Text style={styles.heroSub}>
                Fill exam, college & scholarship forms from home — our team submits them on the official portal.
              </Text>
              <Text style={styles.heroAccent}>Click. Sit. Done. 🎯</Text>
              <View style={styles.heroButtons}>
                <Button title="Browse Forms →" variant="accent" onPress={() => router.push('/forms')} />
              </View>
            </View>
          </LinearGradient>
        )}

        {/* ===== Logged-in dashboard (web parity) ===== */}
        {user ? (
          <>
            {/* Stats cards */}
            <View style={styles.statsContainer}>
              {[
                { icon: 'document-text', color: '#2563eb', bg: '#dbeafe', value: String(totalApps), label: 'Total Forms' },
                { icon: 'checkmark-circle', color: colors.success, bg: '#dcfce7', value: String(completedApps), label: 'Completed' },
                { icon: 'time', color: colors.warning, bg: '#fef3c7', value: String(pendingApps), label: 'In Progress' },
                { icon: 'cash', color: colors.primary, bg: colors.primaryLight, value: formatINR(totalSpent), label: 'Total Spent' },
              ].map((s) => (
                <View key={s.label} style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}>
                  <View style={[styles.statIconBg, { backgroundColor: s.bg }]}>
                    <Ionicons name={s.icon as any} size={18} color={s.color} />
                  </View>
                  <Text style={[styles.statValue, { color: text }]} numberOfLines={1}>
                    {s.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: muted }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* In-progress reminder */}
            {pendingApps > 0 && (
              <View style={[styles.reminderCard, { backgroundColor: isDark ? '#422006' : '#fffbeb', borderColor: isDark ? '#78350f' : '#fde68a' }]}>
                <View style={[styles.reminderIconBg, { backgroundColor: isDark ? '#78350f33' : '#fef3c7' }]}>
                  <Ionicons name="time" size={18} color={colors.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reminderTitle, { color: isDark ? '#fde68a' : '#92400e' }]}>Forms In Progress</Text>
                  <Text style={[styles.reminderText, { color: isDark ? '#fcd34d' : '#b45309' }]}>
                    {pendingApps} application{pendingApps !== 1 ? 's' : ''} being processed. Our team is working on them.
                  </Text>
                </View>
              </View>
            )}

            {/* Upcoming deadlines */}
            {deadlines.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: text }]}>⏰ Upcoming Deadlines</Text>
                {deadlines.map((exam) => {
                  const dl = daysLeft(exam.lastDate);
                  const urgent = dl <= 3;
                  const applied = appliedExamIds.has(exam.id);
                  return (
                    <View
                      key={exam.id}
                      style={[
                        styles.deadlineCard,
                        {
                          backgroundColor: urgent
                            ? isDark ? '#450a0a' : '#fef2f2'
                            : cardBg,
                          borderColor: urgent
                            ? isDark ? '#7f1d1d' : '#fecaca'
                            : borderColor,
                        },
                      ]}
                    >
                      <Pressable style={{ flex: 1, minWidth: 0 }} onPress={() => router.push(`/exam/${exam.id}`)}>
                        <Text style={[styles.deadlineTitle, { color: text }]} numberOfLines={1}>
                          {exam.title}
                        </Text>
                        <Text style={[styles.deadlineDate, { color: muted }]}>
                          {new Date(exam.lastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                      </Pressable>
                      <View style={styles.deadlineRight}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: urgent ? colors.danger : colors.warning }}>
                          {dl}d left
                        </Text>
                        {applied ? (
                          <View style={[styles.appliedPill, { backgroundColor: isDark ? '#052e16' : '#dcfce7' }]}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.success }}>Applied ✓</Text>
                          </View>
                        ) : (
                          <Pressable onPress={() => router.push(`/apply/${exam.id}`)}>
                            <View style={[styles.applyPill]}>
                              <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>Apply</Text>
                            </View>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Recent applications with progress (web parity) */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: text }]}>Recent Applications</Text>
                {apps.length > 0 && (
                  <Pressable onPress={() => router.push('/(tabs)/applications')}>
                    <Text style={[styles.seeAll, { color: colors.primary }]}>View All →</Text>
                  </Pressable>
                )}
              </View>

              {loading ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
              ) : apps.length === 0 ? (
                <Card style={[styles.emptyCard, { backgroundColor: cardBg, borderColor }]}>
                  <Ionicons name="document-text-outline" size={36} color={muted} />
                  <Text style={[styles.emptyTitle, { color: text }]}>No applications yet</Text>
                  <Text style={[styles.emptySub, { color: muted }]}>Browse forms and apply — we'll track everything here.</Text>
                  <Button title="Browse Forms →" onPress={() => router.push('/forms')} style={{ alignSelf: 'stretch' }} />
                </Card>
              ) : (
                apps.slice(0, 3).map((app) => {
                  const paid = app.payment?.status === 'SUCCESS';
                  const meta = STATUS_META[app.status] || { color: muted, bg: isDark ? '#333' : '#eee' };
                  const stepIdx = STATUS_STEPS.findIndex((s) => s.status === app.status);
                  return (
                    <Pressable key={app.id} onPress={() => router.push(`/applications-detail/${app.id}`)}>
                      <Card style={[styles.appCard, { backgroundColor: cardBg, borderColor }]}>
                        <View style={styles.appHeader}>
                          <View style={[styles.appIconBg, { backgroundColor: colors.primaryLight }]}>
                            <Ionicons name="document-text" size={18} color={colors.primary} />
                          </View>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={[styles.appTitle, { color: text }]} numberOfLines={1}>
                              {app.exam.title}
                            </Text>
                            <Text style={[styles.appCategory, { color: muted }]} numberOfLines={1}>
                              {app.exam.category}
                            </Text>
                          </View>
                          <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
                            <Text style={[styles.statusText, { color: meta.color }]} numberOfLines={1}>
                              {STATUS_LABEL[app.status] || app.status}
                            </Text>
                          </View>
                        </View>

                        {/* Progress bar */}
                        <View style={styles.progressWrap}>
                          <View style={[styles.progressTrack, { backgroundColor: isDark ? '#3f3f46' : '#e5e7eb' }]}>
                            <View style={[styles.progressFill, { width: `${getProgress(app.status)}%` }]} />
                          </View>
                          <Text style={[styles.progressPct, { color: colors.primary }]}>{Math.round(getProgress(app.status))}%</Text>
                        </View>

                        <View style={[styles.appFooter, { borderTopColor: borderColor }]}>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: paid ? colors.success : colors.warning }}>
                            {paid ? `Paid ${formatINR(app.payment?.amount ?? 0)}` : '⏳ Payment pending'}
                          </Text>
                          <View style={styles.viewRow}>
                            <Text style={styles.viewText}>Details</Text>
                            <Ionicons name="chevron-forward" size={13} color={colors.primary} />
                          </View>
                        </View>
                      </Card>
                    </Pressable>
                  );
                })
              )}
            </View>

            {/* Quick actions */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: text }]}>Quick Actions</Text>
              {[
                { icon: 'search', color: colors.primary, bg: colors.primaryLight, title: 'Browse Forms', desc: 'Find exams & registrations', route: '/forms' },
                { icon: 'call', color: colors.success, bg: '#dcfce7', title: 'Contact Support', desc: 'Get help with your application', route: '/(tabs)/profile' },
                { icon: 'gift', color: colors.accent, bg: colors.accentLight, title: 'Refer & Earn ₹25', desc: 'Share your code with friends', route: '/(tabs)/profile' },
              ].map((a) => (
                <Pressable key={a.title} onPress={() => router.push(a.route as any)}>
                  <Card style={[styles.actionCard, { backgroundColor: cardBg, borderColor }]}>
                    <View style={[styles.actionIconBg, { backgroundColor: a.bg }]}>
                      <Ionicons name={a.icon as any} size={20} color={a.color} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[styles.actionTitle, { color: text }]}>{a.title}</Text>
                      <Text style={[styles.actionDesc, { color: muted }]} numberOfLines={1}>
                        {a.desc}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={muted} />
                  </Card>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* ===== Guest marketing content (original home) ===== */}
            <View style={styles.trustRow}>
              {[
                { icon: 'shield-checkmark', text: 'Secure & Private' },
                { icon: 'flash', text: 'Fast Processing' },
                { icon: 'headset', text: '24/7 Support' },
              ].map((badge) => (
                <View key={badge.text} style={[styles.trustBadge, { backgroundColor: cardBg, borderColor }]}>
                  <Ionicons name={badge.icon as any} size={16} color={colors.primary} />
                  <Text style={[styles.trustText, { color: text }]}>{badge.text}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: text }]}>How It Works</Text>
                <Text style={[styles.sectionSubtitle, { color: muted }]}>4 simple steps</Text>
              </View>
              <View style={styles.stepsContainer}>
                {MARKETING_STEPS.map((s, i) => (
                  <View key={s.title} style={styles.stepWrapper}>
                    <View style={[styles.step, { backgroundColor: cardBg, borderColor }]}>
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
                    {i < MARKETING_STEPS.length - 1 && (
                      <View style={[styles.stepArrow, { borderColor }]}>
                        <Ionicons name="chevron-forward" size={14} color={muted} />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

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
          </>
        )}

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
    minHeight: 200,
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
  heroWelcome: { fontSize: 24, fontWeight: '900', color: '#ffffff', marginBottom: 6 },
  heroSub: { fontSize: 14, lineHeight: 22, color: '#c7d2fe', marginBottom: 8 },
  heroAccent: { fontSize: 17, fontWeight: '800', color: '#fbbf24', marginBottom: 16 },
  heroButtons: { marginTop: 4 },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: 8,
    marginBottom: spacing.md,
  },
  statCard: {
    width: (SCREEN_WIDTH - 40) / 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  statIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '600' },

  // Reminder
  reminderCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 14,
  },
  reminderIconBg: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  reminderTitle: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  reminderText: { fontSize: 12, lineHeight: 17 },

  // Section
  section: { marginBottom: spacing.lg, paddingHorizontal: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  sectionSubtitle: { fontSize: 13, fontWeight: '500' },
  seeAll: { fontSize: 14, fontWeight: '700' },

  // Deadlines
  deadlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  deadlineTitle: { fontSize: 14, fontWeight: '700' },
  deadlineDate: { fontSize: 12, marginTop: 2 },
  deadlineRight: { alignItems: 'flex-end', gap: 4 },
  appliedPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  applyPill: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },

  // Recent applications
  appCard: { marginBottom: 10, borderWidth: 1 },
  appHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appIconBg: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  appTitle: { fontSize: 15, fontWeight: '700' },
  appCategory: { fontSize: 12, marginTop: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, maxWidth: 90 },
  statusText: { fontSize: 10, fontWeight: '800' },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
  progressPct: { fontSize: 11, fontWeight: '800' },
  appFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  viewRow: { flexDirection: 'row', alignItems: 'center' },
  viewText: { fontSize: 13, fontWeight: '700', color: colors.primary },

  // Empty
  emptyCard: { borderWidth: 1, alignItems: 'center', padding: 24, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptySub: { fontSize: 13, textAlign: 'center', marginBottom: 8 },

  // Quick actions
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, marginBottom: 8 },
  actionIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: 15, fontWeight: '700' },
  actionDesc: { fontSize: 12, marginTop: 2 },

  // Trust badges (guest)
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

  // Steps (guest)
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

  // Exam cards (guest)
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

  // Testimonials (guest)
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

  // CTA (guest)
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

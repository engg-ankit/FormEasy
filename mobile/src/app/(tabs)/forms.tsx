import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { Screen, Card, EmptyState } from '@/components/ui';
import { colors, formatINR, radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { examsApi, type Exam } from '@/lib/api';

export default function FormsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    examsApi
      .list()
      .then((d) => setExams(d.exams))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(exams.map((e) => e.category)))].slice(0, 12),
    [exams]
  );

  const filtered = exams.filter((e) => {
    const matchesQuery =
      !query ||
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.description.toLowerCase().includes(query.toLowerCase());
    const matchesCat = category === 'All' || e.category === category;
    return matchesQuery && matchesCat;
  });

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;

  const renderItem = ({ item }: { item: Exam }) => {
    const daysLeft = Math.ceil((new Date(item.lastDate).getTime() - Date.now()) / 86400000);
    return (
      <Pressable onPress={() => router.push(`/exam/${item.id}`)}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.category}>{item.category}</Text>
            <View style={styles.feeRow}>
              <Text style={[styles.fee, { color: text }]}>{formatINR(item.officialFee + item.serviceFee)}</Text>
            </View>
          </View>
          <Text style={[styles.title, { color: text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.desc, { color: muted }]} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={[styles.deadline, { color: daysLeft <= 7 ? colors.danger : colors.warning }]}>
            {daysLeft <= 7 ? '⚠️ ' : '📅 '}
            {daysLeft < 0 ? 'Closed' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
          </Text>
        </Card>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: muted }]}>Loading forms…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.searchWrap}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: isDark ? colors.dark.card : '#ffffff', borderColor: isDark ? colors.dark.border : colors.border },
          ]}
        >
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search exam, college, scholarship…"
            placeholderTextColor={muted}
            style={[styles.searchInput, { color: text }]}
          />
        </View>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(c) => c}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setCategory(item)}
              style={[
                styles.chip,
                { borderColor: isDark ? colors.dark.border : colors.border },
                item === category && styles.chipActive,
              ]}
            >
              <Text style={[styles.chipText, { color: muted }, item === category && styles.chipTextActive]}>
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="🗂️" title="No forms found" subtitle="Try a different search or category." />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: 16, paddingTop: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  chips: { paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#ffffff' },
  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  card: { gap: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { fontSize: 12, fontWeight: '800', color: colors.accent, textTransform: 'uppercase' },
  feeRow: { flexDirection: 'row', alignItems: 'center' },
  fee: { fontSize: 16, fontWeight: '800' },
  title: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 13, lineHeight: 18 },
  deadline: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 14 },
});
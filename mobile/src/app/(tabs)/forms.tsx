import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, EmptyState } from '@/components/ui';
import { colors, formatINR, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { examsApi, type Exam } from '@/lib/api';

type SortOption = 'deadline' | 'fee-low' | 'fee-high';

const SORT_OPTIONS: { key: SortOption; label: string; icon: string }[] = [
  { key: 'deadline', label: 'Deadline', icon: 'time' },
  { key: 'fee-low', label: 'Fee: Low', icon: 'arrow-down' },
  { key: 'fee-high', label: 'Fee: High', icon: 'arrow-up' },
];

export default function FormsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');
  const [showSort, setShowSort] = useState(false);

  const load = async () => {
    try {
      const d = await examsApi.list();
      setExams(d.exams);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(exams.map((e) => e.category)))].slice(0, 12),
    [exams]
  );

  const filtered = useMemo(() => {
    const result = exams.filter((e) => {
      const matchesQuery =
        !query ||
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.description.toLowerCase().includes(query.toLowerCase()) ||
        e.category.toLowerCase().includes(query.toLowerCase());
      const matchesCat = category === 'All' || e.category === category;
      return matchesQuery && matchesCat;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.lastDate).getTime() - new Date(b.lastDate).getTime();
        case 'fee-low':
          return (a.officialFee + a.serviceFee) - (b.officialFee + b.serviceFee);
        case 'fee-high':
          return (b.officialFee + b.serviceFee) - (a.officialFee + a.serviceFee);
        default:
          return 0;
      }
    });

    return result;
  }, [exams, query, category, sortBy]);

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;
  const cardBg = isDark ? colors.dark.card : colors.card;
  const border = isDark ? colors.dark.border : colors.border;

  const renderItem = ({ item }: { item: Exam }) => {
    const daysLeft = Math.ceil((new Date(item.lastDate).getTime() - Date.now()) / 86400000);
    const isUrgent = daysLeft <= 7 && daysLeft > 0;
    const isClosed = daysLeft < 0;

    return (
      <Pressable onPress={() => router.push(`/exam/${item.id}`)}>
        <Card style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.cardCategory}>
              <Text style={styles.category}>{item.category}</Text>
            </View>
            {isUrgent && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>🔥 {daysLeft}d left</Text>
              </View>
            )}
            {isClosed && (
              <View style={styles.closedBadge}>
                <Text style={styles.closedText}>Closed</Text>
              </View>
            )}
          </View>
          <Text style={[styles.title, { color: text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.desc, { color: muted }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={[styles.fee, { color: colors.primary }]}>
              {formatINR(item.officialFee + item.serviceFee)}
            </Text>
            <View style={styles.deadlineRow}>
              <Ionicons name="time-outline" size={12} color={isUrgent ? colors.danger : muted} />
              <Text style={[styles.deadline, { color: isUrgent ? colors.danger : muted }]}>
                {isClosed ? 'Closed' : `${daysLeft} days left`}
              </Text>
            </View>
          </View>
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
        {/* Search bar */}
        <View
          style={[
            styles.searchBox,
            { backgroundColor: cardBg, borderColor: border },
          ]}
        >
          <Ionicons name="search" size={18} color={muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search exam, college, scholarship…"
            placeholderTextColor={muted}
            style={[styles.searchInput, { color: text }]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={muted} />
            </Pressable>
          )}
        </View>

        {/* Sort button */}
        <Pressable
          onPress={() => setShowSort(!showSort)}
          style={[styles.sortButton, { backgroundColor: cardBg, borderColor: border }]}
        >
          <Ionicons name="swap-vertical" size={16} color={colors.primary} />
          <Text style={[styles.sortText, { color: text }]}>
            {SORT_OPTIONS.find((s) => s.key === sortBy)?.label}
          </Text>
        </Pressable>

        {/* Sort options */}
        {showSort && (
          <View style={[styles.sortDropdown, { backgroundColor: cardBg, borderColor: border }]}>
            {SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => {
                  setSortBy(opt.key);
                  setShowSort(false);
                }}
                style={[
                  styles.sortOption,
                  sortBy === opt.key && { backgroundColor: `${colors.primary}10` },
                ]}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={14}
                  color={sortBy === opt.key ? colors.primary : muted}
                />
                <Text
                  style={[
                    styles.sortOptionText,
                    { color: sortBy === opt.key ? colors.primary : text },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Categories */}
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
                { borderColor: border },
                item === category && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: muted },
                  item === category && styles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={[styles.resultsText, { color: muted }]}>
          {filtered.length} form{filtered.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🔍"
            title="No forms found"
            subtitle={query ? `No results for "${query}". Try different keywords.` : 'No forms available right now.'}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: spacing.md, paddingTop: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    minHeight: 48,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: 10,
  },
  sortText: { fontSize: 13, fontWeight: '600' },
  sortDropdown: {
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: 6,
    padding: 4,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  sortOptionText: { fontSize: 14, fontWeight: '600' },
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
  resultsRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: 8,
  },
  resultsText: { fontSize: 12, fontWeight: '600' },
  list: { paddingHorizontal: spacing.md, paddingBottom: 32, gap: 10 },
  card: { gap: 6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardCategory: {
    backgroundColor: `${colors.accent}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  category: { fontSize: 11, fontWeight: '800', color: colors.accent, textTransform: 'uppercase' },
  urgentBadge: {
    backgroundColor: `${colors.danger}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgentText: { fontSize: 11, fontWeight: '700', color: colors.danger },
  closedBadge: {
    backgroundColor: `${colors.textMuted}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  closedText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  title: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  desc: { fontSize: 13, lineHeight: 18 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  fee: { fontSize: 17, fontWeight: '900' },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deadline: { fontSize: 12, fontWeight: '600' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 14 },
});

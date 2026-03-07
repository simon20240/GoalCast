import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MatchCard } from '@/components/MatchCard';
import { SectionHeader } from '@/components/SectionHeader';
import { PRIORITY_LEAGUES } from '@/services/footballApi';
import * as Haptics from 'expo-haptics';

export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const { liveMatches, toggleFavorite, isFavorite, isRefreshing, refreshData } = useApp();
  const { t, language, isRTL } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<number | null>(null);

  const filtered = activeFilter === null
    ? liveMatches
    : liveMatches.filter(m => m.competitionId === activeFilter);

  // Get unique leagues from live matches for filter
  const liveLeagues = Array.from(new Set(liveMatches.map(m => m.competitionId))).map(id => {
    const league = PRIORITY_LEAGUES.find(l => l.id === id);
    return {
      id,
      label: language === 'ar' ? (league?.shortNameAr || league?.nameAr || String(id)) : (league?.shortName || league?.name || String(id)),
    };
  });

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <View style={[styles.headerLeft, isRTL && styles.rowReverse]}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
            </View>
            <Text style={styles.headerTitle}>{t('liveMatches')}</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{liveMatches.length}</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setActiveFilter(null);
              }}
              style={[styles.filterChip, activeFilter === null && styles.filterActive]}
            >
              <Text style={[styles.filterText, activeFilter === null && styles.filterTextActive]}>
                {t('allMatches')}
              </Text>
            </Pressable>
            {liveLeagues.map(league => (
              <Pressable
                key={league.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveFilter(league.id);
                }}
                style={[styles.filterChip, activeFilter === league.id && styles.filterActive]}
              >
                <Text style={[styles.filterText, activeFilter === league.id && styles.filterTextActive]}>
                  {league.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshData}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        >
          {filtered.length > 0 ? (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="radio" size={16} color={theme.live} />
                  <Text style={styles.statValue}>{filtered.length}</Text>
                  <Text style={styles.statLabel}>{t('live_status')}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="football" size={16} color={theme.accent} />
                  <Text style={styles.statValue}>
                    {filtered.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0)}
                  </Text>
                  <Text style={styles.statLabel}>{t('goals')}</Text>
                </View>
              </View>

              <SectionHeader title={language === 'ar' ? 'جارية الآن' : 'Currently Playing'} />
              {filtered.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  variant="list"
                  onFavorite={() => toggleFavorite(match.id)}
                  isFavorite={isFavorite(match.id)}
                />
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="radio-outline" size={56} color={theme.textMuted} />
              <Text style={styles.emptyTitle}>{t('noLiveMatches')}</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter !== null ? t('noLiveInLeague') : t('checkBackLater')}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  headerRTL: { flexDirection: 'row-reverse' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowReverse: { flexDirection: 'row-reverse' },
  liveIndicator: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,23,68,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.live },
  headerTitle: { fontSize: 24, fontWeight: '800', color: theme.textPrimary },
  countBadge: {
    backgroundColor: theme.live,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: theme.radius.full,
  },
  countText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  filterContainer: { height: 44, marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border,
  },
  filterActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: theme.textSecondary },
  filterTextActive: { color: '#060A13' },
  statsRow: {
    flexDirection: 'row', backgroundColor: theme.surface,
    borderRadius: theme.radius.lg, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: theme.border, alignItems: 'center',
  },
  statItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: theme.textPrimary },
  statLabel: { fontSize: 12, fontWeight: '500', color: theme.textMuted },
  statDivider: { width: 1, height: 28, backgroundColor: theme.border },
  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 80, gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.textPrimary },
  emptySubtitle: { fontSize: 14, color: theme.textMuted, textAlign: 'center' },
});

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MatchCard } from '@/components/MatchCard';
import { SectionHeader } from '@/components/SectionHeader';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { liveMatches, upcomingMatches, finishedMatches, toggleFavorite, isFavorite, isLoading, isRefreshing, refreshData, error } = useApp();
  const { t, language, isRTL } = useLanguage();

  const featuredMatch = liveMatches[0];

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <SafeAreaView edges={['top']} style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>{t('loadingMatches')}</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
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
          {/* Header */}
          <View style={[styles.header, isRTL && styles.headerRTL]}>
            <View style={isRTL ? { alignItems: 'flex-end' } : undefined}>
              <Text style={[styles.appName, isRTL && styles.textRight]}>{t('appName')}</Text>
              <Text style={[styles.appTagline, isRTL && styles.textRight]}>{t('appTagline')}</Text>
            </View>
            <Pressable style={styles.searchBtn} onPress={() => Haptics.selectionAsync()}>
              <Ionicons name="search" size={22} color={theme.textPrimary} />
            </Pressable>
          </View>

          {/* Hero Banner */}
          {featuredMatch ? (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.push(`/match/${featuredMatch.id}`);
              }}
              style={styles.heroBanner}
            >
              <Image
                source={require('@/assets/images/hero-stadium.jpg')}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
              />
              <LinearGradient
                colors={['rgba(6,10,19,0.2)', 'rgba(6,10,19,0.75)', '#060A13']}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.heroContent}>
                <View style={styles.heroLiveBadge}>
                  <View style={styles.heroLiveDot} />
                  <Text style={styles.heroLiveText}>
                    {t('live_status')} · {featuredMatch.minute}'
                  </Text>
                </View>
                <Text style={styles.heroCompetition}>
                  {language === 'ar' ? featuredMatch.competitionAr : featuredMatch.competition}
                </Text>

                <View style={styles.heroTeams}>
                  <View style={styles.heroTeamCol}>
                    <View style={styles.heroLogoWrap}>
                      <Image source={{ uri: featuredMatch.homeTeam.logo }} style={styles.heroLogo} contentFit="contain" />
                    </View>
                    <Text style={styles.heroTeamName}>{featuredMatch.homeTeam.shortName}</Text>
                  </View>
                  <View style={styles.heroScoreCol}>
                    <Text style={styles.heroScore}>{featuredMatch.homeScore} - {featuredMatch.awayScore}</Text>
                  </View>
                  <View style={styles.heroTeamCol}>
                    <View style={styles.heroLogoWrap}>
                      <Image source={{ uri: featuredMatch.awayTeam.logo }} style={styles.heroLogo} contentFit="contain" />
                    </View>
                    <Text style={styles.heroTeamName}>{featuredMatch.awayTeam.shortName}</Text>
                  </View>
                </View>

                <View style={[styles.heroBottom, isRTL && styles.heroBottomRTL]}>
                  <View style={[styles.heroViewers, isRTL && styles.rowReverse]}>
                    <Ionicons name="eye" size={13} color={theme.textMuted} />
                  </View>
                  <Pressable style={[styles.heroWatchBtn, isRTL && styles.rowReverse]}>
                    <Ionicons name="play" size={14} color="#060A13" />
                    <Text style={styles.heroWatchText}>{t('watchNow')}</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ) : null}

          {/* Error State */}
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="warning-outline" size={16} color={theme.warning} />
              <Text style={styles.errorText}>{t('errorLoading')}</Text>
              <Pressable onPress={refreshData}>
                <Text style={styles.retryText}>{t('retry')}</Text>
              </Pressable>
            </View>
          ) : null}

          {/* Live Matches Horizontal */}
          {liveMatches.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionPadded}>
                <SectionHeader
                  title={t('liveNow')}
                  subtitle={t('matchesPlaying', { count: liveMatches.length })}
                  rightElement={
                    <Pressable onPress={() => { Haptics.selectionAsync(); router.push('/(tabs)/live'); }}>
                      <Text style={styles.seeAll}>{t('seeAll')}</Text>
                    </Pressable>
                  }
                />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              >
                {liveMatches.slice(featuredMatch ? 1 : 0).map(match => (
                  <MatchCard key={match.id} match={match} variant="featured" />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Upcoming Matches */}
          {upcomingMatches.length > 0 ? (
            <View style={[styles.section, styles.sectionPadded]}>
              <SectionHeader title={t('upcoming')} subtitle={t('dontMissThese')} />
              {upcomingMatches.slice(0, 6).map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  variant="list"
                  onFavorite={() => toggleFavorite(match.id)}
                  isFavorite={isFavorite(match.id)}
                />
              ))}
            </View>
          ) : null}

          {/* Recent Results */}
          {finishedMatches.length > 0 ? (
            <View style={[styles.section, styles.sectionPadded]}>
              <SectionHeader title={t('recentResults')} />
              {finishedMatches.slice(0, 5).map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  variant="list"
                  onFavorite={() => toggleFavorite(match.id)}
                  isFavorite={isFavorite(match.id)}
                />
              ))}
            </View>
          ) : null}

          {/* No data state */}
          {liveMatches.length === 0 && upcomingMatches.length === 0 && finishedMatches.length === 0 && !error ? (
            <View style={styles.emptyState}>
              <Ionicons name="football-outline" size={56} color={theme.textMuted} />
              <Text style={styles.emptyTitle}>{t('noMatches')}</Text>
              <Text style={styles.emptySubtitle}>{t('pullToRefresh')}</Text>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, fontWeight: '500', color: theme.textMuted, marginTop: 12 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerRTL: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
  rowReverse: { flexDirection: 'row-reverse' },
  appName: { fontSize: 26, fontWeight: '800', color: theme.textPrimary, letterSpacing: -0.5 },
  appTagline: { fontSize: 13, fontWeight: '500', color: theme.textMuted, marginTop: 1 },
  searchBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: theme.border,
  },

  heroBanner: {
    height: 280, marginHorizontal: 16,
    borderRadius: theme.radius.xl, overflow: 'hidden', marginBottom: 8,
  },
  heroContent: { flex: 1, justifyContent: 'flex-end', padding: 20 },
  heroLiveBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,23,68,0.2)',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: theme.radius.full, gap: 6, alignSelf: 'flex-start', marginBottom: 6,
  },
  heroLiveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: theme.live },
  heroLiveText: { fontSize: 12, fontWeight: '700', color: theme.live, letterSpacing: 0.5 },
  heroCompetition: {
    fontSize: 12, fontWeight: '600', color: theme.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },
  heroTeams: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: 14,
  },
  heroTeamCol: { alignItems: 'center', flex: 1 },
  heroLogoWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden', marginBottom: 4,
    justifyContent: 'center', alignItems: 'center',
  },
  heroLogo: { width: 36, height: 36 },
  heroTeamName: { fontSize: 14, fontWeight: '700', color: theme.textPrimary },
  heroScoreCol: { alignItems: 'center', paddingHorizontal: 16 },
  heroScore: { fontSize: 36, fontWeight: '800', color: theme.textPrimary, letterSpacing: 2 },
  heroBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  heroBottomRTL: { flexDirection: 'row-reverse' },
  heroViewers: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroWatchBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: theme.primary,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: theme.radius.full,
  },
  heroWatchText: { fontSize: 13, fontWeight: '700', color: '#060A13' },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: 'rgba(255,214,0,0.1)', padding: 12,
    borderRadius: theme.radius.md, borderWidth: 1,
    borderColor: 'rgba(255,214,0,0.2)',
  },
  errorText: { flex: 1, fontSize: 13, color: theme.warning, fontWeight: '500' },
  retryText: { fontSize: 13, fontWeight: '700', color: theme.primary },

  section: { marginTop: 20 },
  sectionPadded: { paddingHorizontal: 16 },
  seeAll: { fontSize: 13, fontWeight: '600', color: theme.primary },

  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 80, gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.textPrimary },
  emptySubtitle: { fontSize: 14, color: theme.textMuted, textAlign: 'center' },
});

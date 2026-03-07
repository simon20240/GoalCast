import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { theme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { PRIORITY_LEAGUES } from '@/services/footballApi';
import * as Haptics from 'expo-haptics';

const leagueColors: Record<number, string> = {
  2: '#1A237E',    // UCL
  39: '#3D195B',   // EPL
  140: '#EE8707',  // La Liga
  3: '#FF6D00',    // UEL
  135: '#024494',  // Serie A
  78: '#D20515',   // Bundesliga
  61: '#091C3E',   // Ligue 1
  307: '#005C30',  // Saudi
  233: '#C8102E',  // Egypt
  305: '#8D1B3D',  // Qatar
  310: '#C8102E',  // UAE
  200: '#006233',  // Morocco
  12: '#009639',   // CAF CL
  1: '#56042C',    // World Cup
  6: '#009639',    // AFCON
  536: '#003300',  // Arab Cup
  282: '#000000',  // Iraq
  202: '#CE1126',  // Tunisia
  186: '#006233',  // Algeria
  292: '#007A3D',  // Kuwait
};

export default function CompetitionsScreen() {
  const insets = useSafeAreaInsets();
  const { t, language, isRTL } = useLanguage();
  const { allMatches } = useApp();

  // Split into categories
  const topEuropean = PRIORITY_LEAGUES.filter(l => [2, 39, 140, 3, 135, 78, 61].includes(l.id));
  const arabLeagues = PRIORITY_LEAGUES.filter(l => [307, 233, 305, 310, 200, 282, 202, 186, 292].includes(l.id));
  const intl = PRIORITY_LEAGUES.filter(l => [1, 6, 12, 536].includes(l.id));

  const getMatchCount = (leagueId: number) => allMatches.filter(m => m.competitionId === leagueId).length;
  const getLiveCount = (leagueId: number) => allMatches.filter(m => m.competitionId === leagueId && (m.status === 'LIVE' || m.status === 'HT')).length;

  const renderLeagueCard = (league: typeof PRIORITY_LEAGUES[0]) => {
    const matchCount = getMatchCount(league.id);
    const liveCount = getLiveCount(league.id);
    const name = language === 'ar' ? league.nameAr : league.name;
    const color = leagueColors[league.id] || theme.surfaceElevated;

    return (
      <Pressable
        key={league.id}
        onPress={() => Haptics.selectionAsync()}
        style={({ pressed }) => [styles.featuredCard, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
      >
        <View style={[styles.leagueIconWrap, { backgroundColor: color }]}>
          <Ionicons name="trophy" size={24} color="#FFF" />
        </View>
        <Text style={[styles.leagueName, isRTL && styles.textRight]} numberOfLines={1}>{name}</Text>
        <Text style={[styles.leagueMatchCount, isRTL && styles.textRight]}>
          {matchCount} {matchCount === 1 ? t('match') : t('matches')}
        </Text>
        {liveCount > 0 ? (
          <View style={[styles.liveCountBadge, isRTL && styles.rowReverse]}>
            <View style={styles.tinyDot} />
            <Text style={styles.liveCountText}>{liveCount} {t('live_status')}</Text>
          </View>
        ) : null}
      </Pressable>
    );
  };

  const renderLeagueListItem = (league: typeof PRIORITY_LEAGUES[0]) => {
    const matchCount = getMatchCount(league.id);
    const liveCount = getLiveCount(league.id);
    const name = language === 'ar' ? league.nameAr : league.name;
    const color = leagueColors[league.id] || theme.surfaceElevated;

    return (
      <Pressable
        key={league.id}
        onPress={() => Haptics.selectionAsync()}
        style={({ pressed }) => [styles.listCard, isRTL && styles.rowReverse, pressed && { opacity: 0.85 }]}
      >
        <View style={[styles.listIconWrap, { backgroundColor: color }]}>
          <Ionicons name="trophy" size={20} color="#FFF" />
        </View>
        <View style={[styles.listInfo, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={[styles.listName, isRTL && styles.textRight]}>{name}</Text>
          <Text style={[styles.listMeta, isRTL && styles.textRight]}>
            {matchCount} {matchCount === 1 ? t('match') : t('matches')}
            {liveCount > 0 ? ` · ${liveCount} ${t('live_status')}` : ''}
          </Text>
        </View>
        <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={theme.textMuted} />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={[styles.header, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={[styles.headerTitle, isRTL && styles.textRight]}>{t('competitions')}</Text>
          <Text style={[styles.headerSubtitle, isRTL && styles.textRight]}>
            {t('leaguesAvailable', { count: PRIORITY_LEAGUES.length })}
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top European */}
          <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>
            {language === 'ar' ? 'الدوريات الأوروبية الكبرى' : 'TOP EUROPEAN LEAGUES'}
          </Text>
          <View style={styles.featuredGrid}>
            {topEuropean.map(renderLeagueCard)}
          </View>

          {/* Arab & Middle East */}
          <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>
            {language === 'ar' ? 'الدوريات العربية' : 'ARAB LEAGUES'}
          </Text>
          {arabLeagues.map(renderLeagueListItem)}

          {/* International */}
          <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>
            {language === 'ar' ? 'البطولات الدولية' : 'INTERNATIONAL'}
          </Text>
          {intl.map(renderLeagueListItem)}

          {/* Stats Card */}
          <View style={[styles.statsCard, isRTL && styles.rowReverse]}>
            <Ionicons name="stats-chart" size={24} color={theme.primary} />
            <View style={[styles.statsInfo, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.statsTitle, isRTL && styles.textRight]}>{t('seasonCoverage')}</Text>
              <Text style={[styles.statsSubtitle, isRTL && styles.textRight]}>
                {PRIORITY_LEAGUES.length} {t('competitions')} · {t('globalCoverage')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  textRight: { textAlign: 'right' },
  rowReverse: { flexDirection: 'row-reverse' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: theme.textPrimary },
  headerSubtitle: { fontSize: 13, fontWeight: '500', color: theme.textMuted, marginTop: 2 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: theme.textMuted,
    letterSpacing: 1.2, marginBottom: 12, marginTop: 8,
  },
  featuredGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24,
  },
  featuredCard: {
    width: '48%', flexGrow: 1, flexBasis: '46%',
    backgroundColor: theme.surface, borderRadius: theme.radius.lg,
    padding: 16, borderWidth: 1, borderColor: theme.border,
  },
  leagueIconWrap: {
    width: 48, height: 48, borderRadius: theme.radius.md,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  leagueName: { fontSize: 14, fontWeight: '700', color: theme.textPrimary, marginBottom: 2 },
  leagueMatchCount: { fontSize: 12, color: theme.textMuted, fontWeight: '500' },
  liveCountBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 8, backgroundColor: 'rgba(255,23,68,0.1)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: theme.radius.full, alignSelf: 'flex-start',
  },
  tinyDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: theme.live },
  liveCountText: { fontSize: 11, fontWeight: '600', color: theme.live },
  listCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.surface, borderRadius: theme.radius.lg,
    padding: 14, marginBottom: 8, borderWidth: 1,
    borderColor: theme.border, gap: 12,
  },
  listIconWrap: {
    width: 40, height: 40, borderRadius: theme.radius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  listInfo: { flex: 1 },
  listName: { fontSize: 15, fontWeight: '600', color: theme.textPrimary },
  listMeta: { fontSize: 12, color: theme.textMuted, fontWeight: '500', marginTop: 2 },
  statsCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,230,118,0.06)',
    borderRadius: theme.radius.lg, padding: 16,
    marginTop: 20, gap: 12, borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.15)',
  },
  statsInfo: { flex: 1 },
  statsTitle: { fontSize: 14, fontWeight: '700', color: theme.primary },
  statsSubtitle: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
});

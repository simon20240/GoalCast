import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProcessedMatch, fetchStatistics, fetchLineups } from '@/services/footballApi';
import { StreamServer } from '@/services/streamScraper';
import * as Haptics from 'expo-haptics';

type TabId = 'stream' | 'events' | 'lineups' | 'stats';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    toggleFavorite, isFavorite, allMatches,
    getStreamsForMatch, hasStreamsForMatch, botStatus, refreshMatchStreams,
  } = useApp();
  const { t, language, isRTL } = useLanguage();

  const match = allMatches.find(m => m.id === id);
  const streams = id ? getStreamsForMatch(id) : [];
  const hasScrapedStreams = streams.length > 0;
  const showStreamTab = match?.hasStream || hasScrapedStreams;

  const [activeTab, setActiveTab] = useState<TabId>(showStreamTab ? 'stream' : 'events');
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);

  useEffect(() => {
    if (streams.length > 0 && !selectedStreamId) {
      setSelectedStreamId(streams[0].id);
    }
  }, [streams.length]);

  if (!match) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.textMuted, fontSize: 14, marginTop: 12 }}>{t('loading')}</Text>
      </View>
    );
  }

  const compName = language === 'ar' ? match.competitionAr : match.competition;

  const tabs: { id: TabId; label: string; icon: string }[] = [
    ...(showStreamTab ? [{ id: 'stream' as TabId, label: t('stream'), icon: 'play-circle' }] : []),
    { id: 'events', label: t('events'), icon: 'list' },
    { id: 'lineups', label: t('lineups'), icon: 'people' },
    { id: 'stats', label: t('stats'), icon: 'stats-chart' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Match Header */}
          <View style={styles.matchHeader}>
            <Image source={require('@/assets/images/hero-stadium.jpg')} style={StyleSheet.absoluteFillObject} contentFit="cover" />
            <LinearGradient colors={['rgba(6,10,19,0.3)', 'rgba(6,10,19,0.8)', '#060A13']} style={StyleSheet.absoluteFillObject} />

            <View style={styles.navBar}>
              <Pressable onPress={() => { Haptics.selectionAsync(); router.back(); }} style={styles.navBtn}>
                <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color="#FFF" />
              </Pressable>
              <Text style={styles.navTitle}>{compName}</Text>
              <Pressable onPress={() => { Haptics.selectionAsync(); toggleFavorite(match.id); }} style={styles.navBtn}>
                <Ionicons name={isFavorite(match.id) ? 'heart' : 'heart-outline'} size={22} color={isFavorite(match.id) ? theme.live : '#FFF'} />
              </Pressable>
            </View>

            {(match.status === 'LIVE' || match.status === 'HT') ? (
              <View style={match.status === 'HT' ? [styles.statusBadge, { backgroundColor: 'rgba(255,214,0,0.2)' }] : styles.statusBadge}>
                {match.status === 'LIVE' ? <View style={styles.statusDot} /> : null}
                <Text style={[styles.statusText, match.status === 'HT' && { color: theme.warning }]}>
                  {match.status === 'LIVE' ? `${t('live_status')} · ${match.minute}'` : t('halfTime')}
                </Text>
              </View>
            ) : null}
            {match.status === 'FT' ? (
              <View style={[styles.statusBadge, { backgroundColor: 'rgba(123,138,165,0.2)' }]}>
                <Text style={[styles.statusText, { color: theme.textSecondary }]}>{t('fullTime')}</Text>
              </View>
            ) : null}
            {match.status === 'UPCOMING' ? (
              <View style={[styles.statusBadge, { backgroundColor: 'rgba(0,230,118,0.15)' }]}>
                <Ionicons name="time-outline" size={12} color={theme.primary} />
                <Text style={[styles.statusText, { color: theme.primary }]}>{match.date} · {match.startTime}</Text>
              </View>
            ) : null}

            <View style={styles.teamsRow}>
              <View style={styles.teamCol}>
                <View style={styles.logoCircle}>
                  <Image source={{ uri: match.homeTeam.logo }} style={styles.teamLogo} contentFit="contain" />
                </View>
                <Text style={styles.teamName}>{match.homeTeam.shortName}</Text>
              </View>
              <View style={styles.scoreCol}>
                {match.status === 'UPCOMING' ? (
                  <Text style={styles.vsText}>VS</Text>
                ) : (
                  <Text style={styles.scoreText}>{match.homeScore} - {match.awayScore}</Text>
                )}
              </View>
              <View style={styles.teamCol}>
                <View style={styles.logoCircle}>
                  <Image source={{ uri: match.awayTeam.logo }} style={styles.teamLogo} contentFit="contain" />
                </View>
                <Text style={styles.teamName}>{match.awayTeam.shortName}</Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabBar}>
            {tabs.map(tab => (
              <Pressable key={tab.id} onPress={() => { Haptics.selectionAsync(); setActiveTab(tab.id); }} style={[styles.tab, activeTab === tab.id && styles.tabActive]}>
                <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.id ? theme.primary : theme.textMuted} />
                <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
                {tab.id === 'stream' && hasScrapedStreams ? (
                  <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{streams.length}</Text></View>
                ) : null}
              </Pressable>
            ))}
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'stream' ? (
              <StreamTab match={match} streams={streams} selectedStreamId={selectedStreamId} setSelectedStreamId={setSelectedStreamId} botStatus={botStatus} onRefresh={() => id ? refreshMatchStreams(id) : undefined} />
            ) : null}
            {activeTab === 'events' ? <EventsTab match={match} /> : null}
            {activeTab === 'lineups' ? <LineupsTab match={match} /> : null}
            {activeTab === 'stats' ? <StatsTab match={match} /> : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ==========================================
// STREAM TAB - Opens in-app WebView player
// ==========================================

function StreamTab({ match, streams, selectedStreamId, setSelectedStreamId, botStatus, onRefresh }: {
  match: ProcessedMatch; streams: StreamServer[]; selectedStreamId: string | null;
  setSelectedStreamId: (id: string) => void; botStatus: any; onRefresh: () => void;
}) {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const selectedStream = streams.find(s => s.id === selectedStreamId);

  const getTimeSinceLastScan = () => {
    if (!botStatus.lastScrape) return '';
    const seconds = Math.floor((Date.now() - botStatus.lastScrape) / 1000);
    if (seconds < 60) return t('secondsAgo').replace('{count}', String(seconds));
    return t('minutesAgo').replace('{count}', String(Math.floor(seconds / 60)));
  };

  const handleWatchStream = (stream: StreamServer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const encodedUrl = encodeURIComponent(stream.url);
    const encodedName = encodeURIComponent(stream.name);
    const encodedQuality = encodeURIComponent(stream.quality);
    router.push(`/stream/${encodedUrl}?name=${encodedName}&quality=${encodedQuality}`);
  };

  return (
    <View>
      {/* Bot Status Banner */}
      <View style={[styles.botBanner, isRTL && styles.rowReverse]}>
        <View style={[styles.botDotWrap, botStatus.isRunning && styles.botDotActive]}>
          <View style={[styles.botDot, botStatus.isRunning && styles.botDotPulse]} />
        </View>
        <View style={[styles.botInfo, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={[styles.botTitle, isRTL && styles.textRight]}>
            {botStatus.isRunning ? t('botScanning') : t('botActive')}
          </Text>
          <Text style={[styles.botSub, isRTL && styles.textRight]}>
            {botStatus.lastScrape ? `${t('lastScan')}: ${getTimeSinceLastScan()}` : t('scanningForStreams')}
          </Text>
        </View>
        <Pressable onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={18} color={theme.primary} />
        </Pressable>
      </View>

      {/* Player Preview Area */}
      <View style={styles.playerContainer}>
        <Image source={require('@/assets/images/hero-stadium.jpg')} style={StyleSheet.absoluteFillObject} contentFit="cover" />
        <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.playerOverlay}>
          {selectedStream ? (
            <Pressable style={styles.playButton} onPress={() => handleWatchStream(selectedStream)}>
              <Ionicons name="play" size={36} color="#FFF" />
            </Pressable>
          ) : (
            <View style={styles.scanningOverlay}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={styles.scanningText}>{t('scanningForStreams')}</Text>
            </View>
          )}
        </View>
        {selectedStream ? (
          <View style={styles.playerControls}>
            <View style={styles.playerQuality}><Text style={styles.qualityText}>{selectedStream.quality}</Text></View>
            <View style={[styles.playerStatus, selectedStream.status === 'active' && styles.playerStatusActive]}>
              <View style={[styles.statusDotSmall, selectedStream.status === 'active' && styles.statusDotActive]} />
              <Text style={[styles.playerStatusText, selectedStream.status === 'active' && { color: theme.primary }]}>
                {selectedStream.status === 'active' ? t('serverActive') : t('serverChecking')}
              </Text>
            </View>
          </View>
        ) : null}
        <View style={styles.playerProgress}>
          <View style={[styles.playerProgressFill, { width: botStatus.isRunning ? '30%' : '100%' }]} />
        </View>
      </View>

      {/* Watch Now Button */}
      {selectedStream ? (
        <Pressable style={({ pressed }) => [styles.watchNowBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]} onPress={() => handleWatchStream(selectedStream)}>
          <Ionicons name="play-circle" size={22} color="#060A13" />
          <Text style={styles.watchNowText}>{t('watchNow')}</Text>
        </Pressable>
      ) : null}

      {/* Stream Servers List */}
      <Text style={[styles.subHeading, isRTL && styles.textRight]}>
        {t('streamingServers')}{streams.length > 0 ? ` (${streams.length})` : ''}
      </Text>

      {streams.length > 0 ? (
        streams.map(stream => (
          <Pressable
            key={stream.id}
            onPress={() => { Haptics.selectionAsync(); setSelectedStreamId(stream.id); }}
            style={[styles.serverCard, selectedStreamId === stream.id && styles.serverSelected]}
          >
            <View style={[styles.serverTop, isRTL && styles.rowReverse]}>
              <View style={[styles.serverIconWrap, selectedStreamId === stream.id && styles.serverIconActive]}>
                <Ionicons name="server" size={16} color={selectedStreamId === stream.id ? theme.primary : theme.textMuted} />
              </View>
              <View style={[styles.serverInfo, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.serverName, selectedStreamId === stream.id && { color: theme.primary }, isRTL && styles.textRight]}>{stream.name}</Text>
                <View style={[styles.serverMeta, isRTL && styles.rowReverse]}>
                  <View style={styles.qualityTag}><Text style={styles.qualityTagText}>{stream.quality}</Text></View>
                  <View style={[styles.statusIndicator, stream.status === 'active' && styles.statusActive]}>
                    <View style={[styles.statusDotTiny, stream.status === 'active' && { backgroundColor: theme.primary }]} />
                    <Text style={[styles.statusIndicatorText, stream.status === 'active' && { color: theme.primary }]}>
                      {stream.status === 'active' ? t('serverActive') : t('serverChecking')}
                    </Text>
                  </View>
                  <Text style={styles.autoDetectedTag}>{t('autoDetected')}</Text>
                </View>
              </View>
              {selectedStreamId === stream.id ? (
                <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
              ) : (
                <Pressable onPress={() => handleWatchStream(stream)} hitSlop={8} style={styles.playSmallBtn}>
                  <Ionicons name="play" size={14} color={theme.primary} />
                </Pressable>
              )}
            </View>
          </Pressable>
        ))
      ) : (
        <View style={styles.noStreamsState}>
          {botStatus.isRunning ? (
            <>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={styles.noStreamsText}>{t('scanningForStreams')}</Text>
            </>
          ) : (
            <>
              <Ionicons name="search-outline" size={32} color={theme.textMuted} />
              <Text style={styles.noStreamsText}>{t('noStreamsFound')}</Text>
              <Pressable onPress={onRefresh} style={styles.retryBtn}>
                <Ionicons name="refresh" size={16} color={theme.primary} />
                <Text style={styles.retryBtnText}>{t('refreshStreams')}</Text>
              </Pressable>
            </>
          )}
        </View>
      )}

      {botStatus.lastScrape ? (
        <View style={[styles.botStatsRow, isRTL && styles.rowReverse]}>
          <View style={styles.botStatItem}>
            <Ionicons name="scan-outline" size={14} color={theme.textMuted} />
            <Text style={styles.botStatText}>{botStatus.lastScrapeCount} {t('matchesScanned')}</Text>
          </View>
          <View style={styles.botStatDivider} />
          <View style={styles.botStatItem}>
            <Ionicons name="server-outline" size={14} color={theme.textMuted} />
            <Text style={styles.botStatText}>{botStatus.totalStreams} {t('streamsDetected')}</Text>
          </View>
        </View>
      ) : null}

      <View style={[styles.streamInfoNote, isRTL && styles.rowReverse]}>
        <Ionicons name="information-circle-outline" size={16} color={theme.textMuted} />
        <Text style={[styles.streamInfoText, isRTL && styles.textRight]}>{t('serverInfo')}</Text>
      </View>
    </View>
  );
}

// ==========================================
// EVENTS TAB
// ==========================================

function EventsTab({ match }: { match: ProcessedMatch }) {
  const { t, isRTL } = useLanguage();
  const sortedEvents = [...match.events].sort((a, b) => b.minute - a.minute);

  if (sortedEvents.length === 0) {
    return (
      <View style={styles.emptyTab}>
        <Ionicons name="document-text-outline" size={40} color={theme.textMuted} />
        <Text style={styles.emptyTabText}>{t('noEventsYet')}</Text>
        <Text style={styles.emptyTabSub}>{t('eventsAppear')}</Text>
      </View>
    );
  }

  return (
    <View>
      {sortedEvents.map((event, index) => (
        <View key={index} style={[styles.eventRow, isRTL && styles.rowReverse]}>
          <View style={styles.eventMinute}><Text style={styles.eventMinuteText}>{event.minute}'</Text></View>
          <View style={[styles.eventIcon, event.type === 'goal' && styles.eventIconGoal, event.type === 'red' && styles.eventIconRed, event.type === 'yellow' && styles.eventIconYellow]}>
            <Ionicons name={event.type === 'goal' ? 'football' : event.type === 'substitution' ? 'swap-horizontal' : 'square'} size={14} color={event.type === 'goal' ? '#060A13' : event.type === 'red' ? '#FFF' : event.type === 'yellow' ? '#060A13' : theme.textSecondary} />
          </View>
          <View style={[styles.eventInfo, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={[styles.eventPlayer, isRTL && styles.textRight]}>{event.player}</Text>
            <Text style={[styles.eventTeam, isRTL && styles.textRight]}>{event.team === 'home' ? match.homeTeam.name : match.awayTeam.name}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ==========================================
// LINEUPS TAB
// ==========================================

function LineupsTab({ match }: { match: ProcessedMatch }) {
  const { t } = useLanguage();
  const [lineups, setLineups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLineups(match.fixtureId).then(data => { setLineups(data); setLoading(false); }); }, [match.fixtureId]);

  if (loading) return <View style={styles.emptyTab}><ActivityIndicator size="small" color={theme.primary} /><Text style={styles.emptyTabSub}>{t('loading')}</Text></View>;
  if (lineups.length < 2) return <View style={styles.emptyTab}><Ionicons name="people-outline" size={40} color={theme.textMuted} /><Text style={styles.emptyTabText}>{t('lineups')}</Text><Text style={styles.emptyTabSub}>{t('eventsAppear')}</Text></View>;

  const homePlayers = lineups[0]?.startXI || [];
  const awayPlayers = lineups[1]?.startXI || [];
  const maxLen = Math.max(homePlayers.length, awayPlayers.length);

  return (
    <View>
      <View style={styles.lineupHeader}>
        <Text style={styles.lineupTeamTitle}>{match.homeTeam.shortName}</Text>
        <Text style={styles.lineupVs}>{t('startingXI')}</Text>
        <Text style={styles.lineupTeamTitle}>{match.awayTeam.shortName}</Text>
      </View>
      {Array.from({ length: maxLen }).map((_, i) => (
        <View key={i} style={styles.lineupRow}>
          <Text style={styles.lineupNumber}>{homePlayers[i]?.player?.number || ''}</Text>
          <Text style={styles.lineupPlayer}>{homePlayers[i]?.player?.name || ''}</Text>
          <Text style={styles.lineupPlayer}>{awayPlayers[i]?.player?.name || ''}</Text>
          <Text style={styles.lineupNumber}>{awayPlayers[i]?.player?.number || ''}</Text>
        </View>
      ))}
    </View>
  );
}

// ==========================================
// STATS TAB
// ==========================================

function StatsTab({ match }: { match: ProcessedMatch }) {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStatistics(match.fixtureId).then(data => { setStats(data); setLoading(false); }); }, [match.fixtureId]);

  if (loading) return <View style={styles.emptyTab}><ActivityIndicator size="small" color={theme.primary} /><Text style={styles.emptyTabSub}>{t('loading')}</Text></View>;
  if (stats.length < 2) return <View style={styles.emptyTab}><Ionicons name="stats-chart-outline" size={40} color={theme.textMuted} /><Text style={styles.emptyTabText}>{t('stats')}</Text><Text style={styles.emptyTabSub}>{t('eventsAppear')}</Text></View>;

  const homeStats = stats[0]?.statistics || [];
  const awayStats = stats[1]?.statistics || [];
  const statPairs = homeStats.map((hs: any, i: number) => ({
    label: hs.type,
    home: typeof hs.value === 'string' ? parseInt(hs.value) || 0 : hs.value || 0,
    away: typeof awayStats[i]?.value === 'string' ? parseInt(awayStats[i]?.value) || 0 : awayStats[i]?.value || 0,
  }));

  return (
    <View>
      {statPairs.map((stat: any, index: number) => {
        const total = (stat.home + stat.away) || 1;
        const homeWidth = (stat.home / total) * 100;
        const awayWidth = (stat.away / total) * 100;
        return (
          <View key={index} style={styles.statRow}>
            <Text style={[styles.statValue, homeWidth > awayWidth && styles.statValueHighlight]}>{stat.home}</Text>
            <View style={styles.statCenter}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <View style={styles.statBarContainer}>
                <View style={[styles.statBarHome, { width: `${homeWidth}%` }, homeWidth > awayWidth && styles.statBarHighlight]} />
                <View style={[styles.statBarAway, { width: `${awayWidth}%` }, awayWidth > homeWidth && styles.statBarHighlightAway]} />
              </View>
            </View>
            <Text style={[styles.statValue, awayWidth > homeWidth && styles.statValueHighlight]}>{stat.away}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  textRight: { textAlign: 'right' },
  rowReverse: { flexDirection: 'row-reverse' },
  matchHeader: { height: 340, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 20, paddingHorizontal: 16 },
  navBar: { position: 'absolute', top: 8, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,23,68,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: theme.radius.full, gap: 6, marginBottom: 16 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: theme.live },
  statusText: { fontSize: 12, fontWeight: '700', color: theme.live, letterSpacing: 0.5 },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 12 },
  teamCol: { alignItems: 'center', flex: 1 },
  logoCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 8, justifyContent: 'center', alignItems: 'center' },
  teamLogo: { width: 44, height: 44 },
  teamName: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  scoreCol: { alignItems: 'center', paddingHorizontal: 20 },
  scoreText: { fontSize: 48, fontWeight: '800', color: '#FFF', letterSpacing: 4 },
  vsText: { fontSize: 28, fontWeight: '700', color: theme.textMuted },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.border, paddingHorizontal: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 5 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: theme.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: theme.textMuted },
  tabTextActive: { color: theme.primary },
  tabBadge: { backgroundColor: theme.primary, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 4 },
  tabBadgeText: { fontSize: 10, fontWeight: '700', color: '#060A13' },
  tabContent: { paddingHorizontal: 16, paddingTop: 16 },

  // Bot
  botBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(0,230,118,0.06)', borderRadius: theme.radius.lg, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,230,118,0.12)' },
  botDotWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,230,118,0.1)', justifyContent: 'center', alignItems: 'center' },
  botDotActive: { backgroundColor: 'rgba(0,230,118,0.2)' },
  botDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary, opacity: 0.6 },
  botDotPulse: { opacity: 1 },
  botInfo: { flex: 1 },
  botTitle: { fontSize: 13, fontWeight: '600', color: theme.primary },
  botSub: { fontSize: 11, fontWeight: '500', color: theme.textMuted, marginTop: 2 },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,230,118,0.1)', justifyContent: 'center', alignItems: 'center' },

  // Player Preview
  playerContainer: { height: 210, borderRadius: theme.radius.xl, overflow: 'hidden', marginBottom: 16, backgroundColor: '#000', position: 'relative' },
  playerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  playButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(0,230,118,0.85)', justifyContent: 'center', alignItems: 'center', paddingLeft: 4 },
  scanningOverlay: { alignItems: 'center', gap: 8 },
  scanningText: { fontSize: 13, fontWeight: '500', color: theme.textMuted },
  playerControls: { position: 'absolute', bottom: 14, left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  playerQuality: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  qualityText: { fontSize: 11, fontWeight: '600', color: '#FFF' },
  playerStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  playerStatusActive: { backgroundColor: 'rgba(0,230,118,0.2)' },
  statusDotSmall: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: theme.textMuted },
  statusDotActive: { backgroundColor: theme.primary },
  playerStatusText: { fontSize: 11, fontWeight: '600', color: theme.textMuted },
  playerProgress: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  playerProgressFill: { height: 3, backgroundColor: theme.primary },

  // Watch Now
  watchNowBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: theme.primary, paddingVertical: 16, borderRadius: theme.radius.lg, marginBottom: 20 },
  watchNowText: { fontSize: 17, fontWeight: '800', color: '#060A13' },

  subHeading: { fontSize: 16, fontWeight: '700', color: theme.textPrimary, marginBottom: 12 },

  // Server Cards
  serverCard: { backgroundColor: theme.surface, borderRadius: theme.radius.lg, padding: 14, borderWidth: 1.5, borderColor: theme.border, marginBottom: 8 },
  serverSelected: { borderColor: theme.primary, backgroundColor: 'rgba(0,230,118,0.05)' },
  serverTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  serverIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(123,138,165,0.1)', justifyContent: 'center', alignItems: 'center' },
  serverIconActive: { backgroundColor: 'rgba(0,230,118,0.1)' },
  serverInfo: { flex: 1 },
  serverName: { fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 4 },
  serverMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qualityTag: { backgroundColor: 'rgba(0,230,118,0.1)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: theme.radius.sm },
  qualityTagText: { fontSize: 10, fontWeight: '600', color: theme.primary },
  statusIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusActive: {},
  statusDotTiny: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.textMuted },
  statusIndicatorText: { fontSize: 10, fontWeight: '500', color: theme.textMuted },
  autoDetectedTag: { fontSize: 10, fontWeight: '500', color: theme.accent },
  playSmallBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,230,118,0.1)', justifyContent: 'center', alignItems: 'center' },

  // No Streams
  noStreamsState: { alignItems: 'center', paddingVertical: 40, gap: 10, backgroundColor: theme.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.border },
  noStreamsText: { fontSize: 14, fontWeight: '500', color: theme.textMuted },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: 'rgba(0,230,118,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.radius.full },
  retryBtnText: { fontSize: 13, fontWeight: '600', color: theme.primary },

  botStatsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: theme.radius.md, padding: 12, marginTop: 12, borderWidth: 1, borderColor: theme.border },
  botStatItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  botStatText: { fontSize: 11, fontWeight: '500', color: theme.textMuted },
  botStatDivider: { width: 1, height: 20, backgroundColor: theme.border },

  streamInfoNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12, backgroundColor: theme.surface, padding: 14, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.border },
  streamInfoText: { fontSize: 12, color: theme.textMuted, flex: 1, lineHeight: 18 },

  // Events
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, paddingVertical: 6 },
  eventMinute: { width: 36, alignItems: 'center' },
  eventMinuteText: { fontSize: 14, fontWeight: '700', color: theme.textSecondary },
  eventIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center' },
  eventIconGoal: { backgroundColor: theme.primary },
  eventIconRed: { backgroundColor: theme.live },
  eventIconYellow: { backgroundColor: theme.warning },
  eventInfo: { flex: 1 },
  eventPlayer: { fontSize: 14, fontWeight: '600', color: theme.textPrimary },
  eventTeam: { fontSize: 12, color: theme.textMuted, marginTop: 1 },
  emptyTab: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTabText: { fontSize: 16, fontWeight: '600', color: theme.textPrimary },
  emptyTabSub: { fontSize: 13, color: theme.textMuted },

  // Lineups
  lineupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  lineupTeamTitle: { fontSize: 16, fontWeight: '700', color: theme.textPrimary, width: 50, textAlign: 'center' },
  lineupVs: { fontSize: 12, fontWeight: '600', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  lineupRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(30,42,66,0.4)' },
  lineupNumber: { width: 28, fontSize: 12, fontWeight: '600', color: theme.textMuted, textAlign: 'center' },
  lineupPlayer: { flex: 1, fontSize: 14, fontWeight: '500', color: theme.textPrimary, textAlign: 'center' },

  // Stats
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 10 },
  statValue: { fontSize: 15, fontWeight: '600', color: theme.textSecondary, width: 44, textAlign: 'center' },
  statValueHighlight: { color: theme.textPrimary, fontWeight: '700' },
  statCenter: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, fontWeight: '500', color: theme.textMuted, marginBottom: 6 },
  statBarContainer: { flexDirection: 'row', width: '100%', height: 5, borderRadius: 2.5, overflow: 'hidden', gap: 2 },
  statBarHome: { height: 5, backgroundColor: 'rgba(123,138,165,0.3)', borderRadius: 2.5 },
  statBarAway: { height: 5, backgroundColor: 'rgba(123,138,165,0.3)', borderRadius: 2.5 },
  statBarHighlight: { backgroundColor: theme.primary },
  statBarHighlightAway: { backgroundColor: theme.accent },
});

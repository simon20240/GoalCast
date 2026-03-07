import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { ProcessedMatch, formatViewers } from '@/services/footballApi';
import { useLanguage } from '@/contexts/LanguageContext';
import * as Haptics from 'expo-haptics';

interface MatchCardProps {
  match: ProcessedMatch;
  variant?: 'compact' | 'featured' | 'list';
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export function MatchCard({ match, variant = 'compact', onFavorite, isFavorite }: MatchCardProps) {
  const router = useRouter();
  const { language, isRTL } = useLanguage();

  const compName = language === 'ar' ? match.competitionAr : match.competition;

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push(`/match/${match.id}`);
  };

  const handleFavorite = () => {
    Haptics.selectionAsync();
    onFavorite?.();
  };

  if (variant === 'featured') {
    return (
      <Pressable onPress={handlePress} style={({ pressed }) => [styles.featuredCard, pressed && styles.pressed]}>
        <View style={[styles.featuredHeader, isRTL && styles.rowReverse]}>
          <View style={styles.competitionBadge}>
            {match.leagueLogo ? (
              <Image source={{ uri: match.leagueLogo }} style={styles.leagueLogoSmall} contentFit="contain" />
            ) : null}
            <Text style={styles.competitionText} numberOfLines={1}>{compName}</Text>
          </View>
          {match.status === 'LIVE' && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{match.minute}'</Text>
            </View>
          )}
          {match.status === 'HT' && (
            <View style={[styles.liveBadge, { backgroundColor: 'rgba(255,214,0,0.15)' }]}>
              <Text style={[styles.liveText, { color: theme.warning }]}>HT</Text>
            </View>
          )}
        </View>

        <View style={styles.featuredTeams}>
          <View style={styles.featuredTeamCol}>
            <View style={styles.teamLogoContainer}>
              <Image source={{ uri: match.homeTeam.logo }} style={styles.featuredLogo} contentFit="contain" />
            </View>
            <Text style={styles.featuredTeamName} numberOfLines={1}>{match.homeTeam.shortName}</Text>
          </View>

          <View style={styles.featuredScoreCol}>
            <Text style={styles.featuredScore}>
              {match.status === 'UPCOMING' ? 'vs' : `${match.homeScore} - ${match.awayScore}`}
            </Text>
            {match.status === 'UPCOMING' && (
              <Text style={styles.featuredTime}>{match.startTime}</Text>
            )}
          </View>

          <View style={styles.featuredTeamCol}>
            <View style={styles.teamLogoContainer}>
              <Image source={{ uri: match.awayTeam.logo }} style={styles.featuredLogo} contentFit="contain" />
            </View>
            <Text style={styles.featuredTeamName} numberOfLines={1}>{match.awayTeam.shortName}</Text>
          </View>
        </View>

        {match.hasStream && (
          <View style={styles.streamBadge}>
            <Ionicons name="play-circle" size={14} color={theme.primary} />
            <Text style={styles.streamText}>{language === 'ar' ? 'شاهد مباشر' : 'Watch Live'}</Text>
          </View>
        )}
      </Pressable>
    );
  }

  if (variant === 'list') {
    return (
      <Pressable onPress={handlePress} style={({ pressed }) => [styles.listCard, pressed && styles.pressed]}>
        <View style={[styles.listLeft, isRTL && { alignItems: 'flex-end' }]}>
          <View style={[styles.listCompetition, isRTL && styles.rowReverse]}>
            {match.leagueLogo ? (
              <Image source={{ uri: match.leagueLogo }} style={styles.leagueLogoTiny} contentFit="contain" />
            ) : null}
            <Text style={styles.listCompText} numberOfLines={1}>{compName}</Text>
            {match.status === 'LIVE' && (
              <View style={styles.liveBadgeSmall}>
                <View style={styles.liveDotSmall} />
                <Text style={styles.liveBadgeSmallText}>{match.minute}'</Text>
              </View>
            )}
            {match.status === 'HT' && (
              <View style={[styles.liveBadgeSmall, { backgroundColor: 'rgba(255,214,0,0.15)' }]}>
                <Text style={[styles.liveBadgeSmallText, { color: theme.warning }]}>HT</Text>
              </View>
            )}
            {match.status === 'FT' && (
              <View style={[styles.liveBadgeSmall, { backgroundColor: 'rgba(123,138,165,0.15)' }]}>
                <Text style={[styles.liveBadgeSmallText, { color: theme.textSecondary }]}>FT</Text>
              </View>
            )}
          </View>

          <View style={[styles.listTeamRow, isRTL && styles.rowReverse]}>
            <Image source={{ uri: match.homeTeam.logo }} style={styles.listLogo} contentFit="contain" />
            <Text style={[styles.listTeamName, isRTL && { textAlign: 'right' }]} numberOfLines={1}>{match.homeTeam.name}</Text>
            <Text style={[styles.listScore, match.homeScore > match.awayScore && styles.winScore]}>{match.status === 'UPCOMING' ? '' : match.homeScore}</Text>
          </View>
          <View style={[styles.listTeamRow, isRTL && styles.rowReverse]}>
            <Image source={{ uri: match.awayTeam.logo }} style={styles.listLogo} contentFit="contain" />
            <Text style={[styles.listTeamName, isRTL && { textAlign: 'right' }]} numberOfLines={1}>{match.awayTeam.name}</Text>
            <Text style={[styles.listScore, match.awayScore > match.homeScore && styles.winScore]}>{match.status === 'UPCOMING' ? '' : match.awayScore}</Text>
          </View>

          {match.status === 'UPCOMING' && (
            <View style={[styles.listTimeRow, isRTL && styles.rowReverse]}>
              <Ionicons name="time-outline" size={12} color={theme.textMuted} />
              <Text style={styles.listTime}>{match.date} · {match.startTime}</Text>
            </View>
          )}
        </View>

        <View style={styles.listRight}>
          {onFavorite ? (
            <Pressable onPress={handleFavorite} hitSlop={12}>
              <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? theme.live : theme.textMuted} />
            </Pressable>
          ) : null}
          {match.hasStream ? (
            <View style={styles.streamIconBadge}>
              <Ionicons name="play" size={10} color={theme.primary} />
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  }

  // Compact
  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [styles.compactCard, pressed && styles.pressed]}>
      <View style={styles.compactTop}>
        {match.status === 'LIVE' && (
          <View style={styles.liveBadgeSmall}>
            <View style={styles.liveDotSmall} />
            <Text style={styles.liveBadgeSmallText}>{match.minute}'</Text>
          </View>
        )}
        {match.status === 'HT' && (
          <View style={[styles.liveBadgeSmall, { backgroundColor: 'rgba(255,214,0,0.15)' }]}>
            <Text style={[styles.liveBadgeSmallText, { color: theme.warning }]}>HT</Text>
          </View>
        )}
        {match.status === 'UPCOMING' && (
          <Text style={styles.compactTime}>{match.startTime}</Text>
        )}
      </View>

      <View style={styles.compactTeams}>
        <View style={[styles.compactTeamRow, isRTL && styles.rowReverse]}>
          <Image source={{ uri: match.homeTeam.logo }} style={styles.compactLogo} contentFit="contain" />
          <Text style={styles.compactTeamName} numberOfLines={1}>{match.homeTeam.shortName}</Text>
          {match.status !== 'UPCOMING' && (
            <Text style={[styles.compactScore, match.homeScore > match.awayScore && styles.winScore]}>{match.homeScore}</Text>
          )}
        </View>
        <View style={[styles.compactTeamRow, isRTL && styles.rowReverse]}>
          <Image source={{ uri: match.awayTeam.logo }} style={styles.compactLogo} contentFit="contain" />
          <Text style={styles.compactTeamName} numberOfLines={1}>{match.awayTeam.shortName}</Text>
          {match.status !== 'UPCOMING' && (
            <Text style={[styles.compactScore, match.awayScore > match.homeScore && styles.winScore]}>{match.awayScore}</Text>
          )}
        </View>
      </View>

      <Text style={styles.compactComp} numberOfLines={1}>{compName}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  rowReverse: { flexDirection: 'row-reverse' },

  leagueLogoSmall: { width: 16, height: 16, borderRadius: 3 },
  leagueLogoTiny: { width: 14, height: 14, borderRadius: 2 },

  featuredCard: {
    backgroundColor: theme.surfaceElevated,
    borderRadius: theme.radius.xl,
    padding: 20,
    width: 280,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  competitionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,230,118,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    gap: 5,
    flex: 1,
    marginRight: 8,
  },
  competitionText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.primary,
    letterSpacing: 0.3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,23,68,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.live,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.live,
  },
  featuredTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredTeamCol: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  featuredLogo: {
    width: 40,
    height: 40,
  },
  featuredTeamName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
    textAlign: 'center',
  },
  featuredScoreCol: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  featuredScore: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.textPrimary,
    letterSpacing: 2,
  },
  featuredTime: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
    marginTop: 2,
  },
  streamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 16,
    backgroundColor: 'rgba(0,230,118,0.08)',
    paddingVertical: 8,
    borderRadius: theme.radius.md,
  },
  streamText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.primary,
  },

  // List
  listCard: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  listLeft: { flex: 1 },
  listCompetition: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  listCompText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textMuted,
    letterSpacing: 0.3,
  },
  liveBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,23,68,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
    gap: 4,
  },
  liveDotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.live,
  },
  liveBadgeSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.live,
  },
  listTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  listLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  listTeamName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
    flex: 1,
  },
  listScore: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textSecondary,
    minWidth: 20,
    textAlign: 'right',
  },
  winScore: {
    color: theme.textPrimary,
  },
  listTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  listTime: {
    fontSize: 12,
    color: theme.textMuted,
    fontWeight: '500',
  },
  listRight: {
    alignItems: 'center',
    gap: 12,
    marginLeft: 12,
  },
  streamIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,230,118,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Compact
  compactCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    padding: 14,
    width: 165,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  compactTop: {
    marginBottom: 12,
  },
  compactTime: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
  },
  compactTeams: {
    gap: 8,
    marginBottom: 10,
  },
  compactTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  compactTeamName: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textPrimary,
    flex: 1,
  },
  compactScore: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.textSecondary,
  },
  compactComp: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.textMuted,
    letterSpacing: 0.3,
  },
});

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MatchCard } from '@/components/MatchCard';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite, isFavorite, allMatches } = useApp();
  const { t, isRTL } = useLanguage();

  const favoriteMatches = allMatches.filter(m => favorites.includes(m.id));

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={[styles.header, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={[styles.headerTitle, isRTL && styles.textRight]}>{t('favorites')}</Text>
          {favoriteMatches.length > 0 ? (
            <Text style={[styles.headerSubtitle, isRTL && styles.textRight]}>
              {t('savedMatches', { count: favoriteMatches.length })}
            </Text>
          ) : null}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
        >
          {favoriteMatches.length > 0 ? (
            favoriteMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                variant="list"
                onFavorite={() => toggleFavorite(match.id)}
                isFavorite={isFavorite(match.id)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Image
                source={require('@/assets/images/empty-favorites.png')}
                style={styles.emptyImage}
                contentFit="contain"
              />
              <Text style={styles.emptyTitle}>{t('noFavoritesYet')}</Text>
              <Text style={styles.emptySubtitle}>{t('tapHeartToSave')}</Text>
              <View style={[styles.emptyHint, isRTL && { flexDirection: 'row-reverse' }]}>
                <Ionicons name="heart-outline" size={16} color={theme.primary} />
                <Text style={styles.emptyHintText}>{t('browseAndSave')}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  textRight: { textAlign: 'right' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: theme.textPrimary },
  headerSubtitle: { fontSize: 13, fontWeight: '500', color: theme.textMuted, marginTop: 2 },
  emptyContainer: {
    alignItems: 'center', justifyContent: 'center',
    paddingTop: 60, paddingHorizontal: 32,
  },
  emptyImage: { width: 180, height: 180, marginBottom: 24, opacity: 0.8 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: theme.textPrimary, marginBottom: 8 },
  emptySubtitle: {
    fontSize: 14, color: theme.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24,
  },
  emptyHint: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,230,118,0.08)',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: theme.radius.full,
  },
  emptyHintText: { fontSize: 13, fontWeight: '600', color: theme.primary },
});

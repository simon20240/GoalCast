import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { notificationsEnabled, toggleNotifications } = useApp();

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={[styles.header, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={[styles.headerTitle, isRTL && styles.textRight]}>{t('settings')}</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Language Selection */}
          <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>{t('language')}</Text>
          <View style={styles.languageRow}>
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setLanguage('ar'); }}
              style={[styles.langBtn, language === 'ar' && styles.langBtnActive]}
            >
              <Text style={styles.langFlag}>🇸🇦</Text>
              <Text style={[styles.langText, language === 'ar' && styles.langTextActive]}>العربية</Text>
              {language === 'ar' ? (
                <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
              ) : null}
            </Pressable>
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setLanguage('en'); }}
              style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
            >
              <Text style={styles.langFlag}>🇬🇧</Text>
              <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>English</Text>
              {language === 'en' ? (
                <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
              ) : null}
            </Pressable>
          </View>

          {/* Notifications */}
          <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>{t('general')}</Text>
          <Pressable
            onPress={() => { Haptics.selectionAsync(); toggleNotifications(); }}
            style={[styles.settingRow, isRTL && styles.rowReverse]}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="notifications-outline" size={20} color={theme.primary} />
            </View>
            <View style={[styles.settingInfo, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.settingTitle, isRTL && styles.textRight]}>{t('notifications')}</Text>
            </View>
            <View style={[styles.toggle, notificationsEnabled && styles.toggleActive]}>
              <View style={[styles.toggleDot, notificationsEnabled && styles.toggleDotActive]} />
            </View>
          </Pressable>

          {/* About */}
          <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>{t('about')}</Text>
          <View style={styles.aboutCard}>
            <View style={[styles.aboutRow, isRTL && styles.rowReverse]}>
              <Text style={styles.aboutLabel}>{t('version')}</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.aboutDivider} />
            <View style={[styles.aboutRow, isRTL && styles.rowReverse]}>
              <Text style={styles.aboutLabel}>{t('dataSource')}</Text>
              <Text style={styles.aboutValue}>{t('liveApi')}</Text>
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
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: theme.textMuted,
    letterSpacing: 1.2, marginBottom: 12, marginTop: 20,
  },
  languageRow: { gap: 10 },
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.surface, borderRadius: theme.radius.lg,
    padding: 16, borderWidth: 1.5, borderColor: theme.border,
    marginBottom: 8,
  },
  langBtnActive: {
    borderColor: theme.primary,
    backgroundColor: 'rgba(0,230,118,0.05)',
  },
  langFlag: { fontSize: 24 },
  langText: { flex: 1, fontSize: 16, fontWeight: '600', color: theme.textSecondary },
  langTextActive: { color: theme.textPrimary },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.surface, borderRadius: theme.radius.lg,
    padding: 16, borderWidth: 1, borderColor: theme.border,
    marginBottom: 8,
  },
  settingIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,230,118,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '600', color: theme.textPrimary },
  toggle: {
    width: 50, height: 28, borderRadius: 14,
    backgroundColor: theme.border, padding: 3,
    justifyContent: 'center',
  },
  toggleActive: { backgroundColor: theme.primary },
  toggleDot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#FFF',
  },
  toggleDotActive: { alignSelf: 'flex-end' },
  aboutCard: {
    backgroundColor: theme.surface, borderRadius: theme.radius.lg,
    borderWidth: 1, borderColor: theme.border, overflow: 'hidden',
  },
  aboutRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
  },
  aboutDivider: { height: 1, backgroundColor: theme.border },
  aboutLabel: { fontSize: 14, fontWeight: '500', color: theme.textSecondary },
  aboutValue: { fontSize: 14, fontWeight: '600', color: theme.textPrimary },
});

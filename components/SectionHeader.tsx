import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, rightElement }: SectionHeaderProps) {
  const { isRTL } = useLanguage();

  return (
    <View style={[styles.container, isRTL && styles.containerRTL]}>
      <View style={isRTL ? { alignItems: 'flex-end' } : undefined}>
        <Text style={[styles.title, isRTL && styles.textRight]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, isRTL && styles.textRight]}>{subtitle}</Text> : null}
      </View>
      {rightElement}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 8,
  },
  containerRTL: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textMuted,
    marginTop: 2,
  },
  textRight: {
    textAlign: 'right',
  },
});

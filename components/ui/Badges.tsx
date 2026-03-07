import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface LivePulseBadgeProps {
  minute?: number;
  compact?: boolean;
}

export function LivePulseBadge({ minute, compact }: LivePulseBadgeProps) {
  return (
    <View style={[styles.badge, compact && styles.badgeCompact]}>
      <View style={styles.dot} />
      <Text style={styles.text}>LIVE{minute ? ` · ${minute}'` : ''}</Text>
    </View>
  );
}

interface ServerBadgeProps {
  name: string;
  quality: string;
  latency: string;
  selected: boolean;
  onPress: () => void;
}

export function ServerBadge({ name, quality, latency, selected, onPress }: ServerBadgeProps) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={[styles.serverCard, selected && styles.serverSelected]}>
      <View style={styles.serverTop}>
        <Ionicons name="server" size={16} color={selected ? theme.primary : theme.textMuted} />
        <Text style={[styles.serverName, selected && { color: theme.primary }]}>{name}</Text>
      </View>
      <View style={styles.serverMeta}>
        <View style={styles.serverTag}>
          <Text style={styles.serverTagText}>{quality}</Text>
        </View>
        <Text style={styles.serverLatency}>{latency} latency</Text>
      </View>
      {selected && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,23,68,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    gap: 6,
    alignSelf: 'flex-start',
  },
  badgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.live,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.live,
    letterSpacing: 0.5,
  },

  // Server
  serverCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    padding: 14,
    borderWidth: 1.5,
    borderColor: theme.border,
    marginBottom: 8,
    position: 'relative',
  },
  serverSelected: {
    borderColor: theme.primary,
    backgroundColor: 'rgba(0,230,118,0.05)',
  },
  serverTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  serverName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  serverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serverTag: {
    backgroundColor: 'rgba(0,230,118,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  serverTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.primary,
  },
  serverLatency: {
    fontSize: 11,
    color: theme.textMuted,
    fontWeight: '500',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
});

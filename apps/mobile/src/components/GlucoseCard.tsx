import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '@rangexp/theme';
import { Rex } from './Rex';

export type GlucoseStatus = 'low' | 'normal' | 'high';

interface GlucoseCardProps {
  value: number;
  unit?: 'mg/dL' | 'mmol/L';
  status: GlucoseStatus;
  timestamp: string;
  notes?: string;
  trend?: 'up' | 'down' | 'stable';
  onPress?: () => void;
  showRex?: boolean;
  style?: ViewStyle;
}

const statusConfig = {
  low: {
    color: theme.colors.glucose.low,
    label: 'Bajo',
    icon: '📉',
    rexMood: 'support' as const,
  },
  normal: {
    color: theme.colors.glucose.normal,
    label: 'En rango',
    icon: '✅',
    rexMood: 'happy' as const,
  },
  high: {
    color: theme.colors.glucose.high,
    label: 'Alto',
    icon: '📈',
    rexMood: 'support' as const,
  },
};

const trendIcons = {
  up: '↑',
  down: '↓',
  stable: '→',
};

export function GlucoseCard({
  value,
  unit = 'mg/dL',
  status,
  timestamp,
  notes,
  trend,
  onPress,
  showRex = false,
  style,
}: GlucoseCardProps) {
  const config = statusConfig[status];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor: config.color },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Rex indicator */}
      {showRex && (
        <View style={styles.rexContainer}>
          <Rex mood={config.rexMood} size="small" />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
          <Text style={styles.statusText}>{config.label}</Text>
        </View>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>

      {/* Value */}
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: config.color }]}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
        {trend && (
          <Text style={[styles.trend, { color: config.color }]}>
            {trendIcons[trend]}
          </Text>
        )}
      </View>

      {/* Notes */}
      {notes && (
        <Text style={styles.notes} numberOfLines={2}>
          {notes}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    ...theme.shadows.card,
  },
  rexContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timestamp: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary.light,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 36,
    fontWeight: '700',
  },
  unit: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  trend: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    marginLeft: 8,
  },
  notes: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

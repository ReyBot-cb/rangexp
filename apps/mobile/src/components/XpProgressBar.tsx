import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, ViewStyle } from 'react-native';
import { theme } from '@rangexp/theme';

interface XpProgressBarProps {
  currentXp: number;
  nextLevelXp: number;
  level: number;
  showDetails?: boolean;
  animated?: boolean;
  style?: ViewStyle;
}

export function XpProgressBar({
  currentXp,
  nextLevelXp,
  level,
  showDetails = true,
  animated = true,
  style,
}: XpProgressBarProps) {
  const progress = Math.min(currentXp / nextLevelXp, 1);
  const xpToNext = nextLevelXp - currentXp;
  
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, animated]);

  const width = animated ? animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  }) : `${progress * 100}%`;

  return (
    <View style={[styles.container, style]}>
      {/* Level badge */}
      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>{level}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.fill,
              {
                width,
                backgroundColor: theme.colors.gamification.xp,
              },
            ]}
          />
        </View>
        
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glow,
            {
              left: width,
              opacity: animated ? animatedProgress : progress,
            },
          ]}
        />
      </View>

      {/* Details */}
      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.currentXp}>{currentXp} XP</Text>
          <Text style={styles.remaining}>{xpToNext} para siguiente nivel</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.primary,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.rex,
  },
  levelText: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.xl,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  progressContainer: {
    flex: 1,
    position: 'relative',
  },
  track: {
    height: 14,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 7,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 7,
  },
  glow: {
    position: 'absolute',
    top: -2,
    width: 20,
    height: 18,
    backgroundColor: theme.colors.gamification.xpLight,
    borderRadius: 9,
    blurRadius: 8,
  },
  details: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
  },
  currentXp: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gamification.xp,
    fontWeight: '700',
  },
  remaining: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary.light,
  },
});

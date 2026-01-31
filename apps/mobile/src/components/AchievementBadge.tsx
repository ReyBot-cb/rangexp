import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated, ViewStyle } from 'react-native';
import { theme } from '@rangexp/theme';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface AchievementBadgeProps {
  icon: string;
  name: string;
  rarity: AchievementRarity;
  unlocked: boolean;
  description?: string;
  progress?: number; // 0-100 for locked achievements
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  showAnimation?: boolean;
  style?: ViewStyle;
}

const rarityColors = {
  common: theme.colors.gamification.achievement,
  rare: theme.colors.gamification.rare,
  epic: theme.colors.gamification.epic,
  legendary: theme.colors.gamification.legendary,
};

const rarityLabels = {
  common: 'Común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario',
};

export function AchievementBadge({
  icon,
  name,
  rarity,
  unlocked,
  description,
  progress,
  size = 'medium',
  onPress,
  showAnimation = false,
  style,
}: AchievementBadgeProps) {
  const badgeSize = size === 'small' ? 60 : size === 'medium' ? 80 : 120;
  const iconSize = badgeSize * 0.4;
  const color = unlocked ? rarityColors[rarity] : theme.colors.text.disabled.light;
  
  // Unlock animation
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showAnimation && unlocked) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 10,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Particle effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(particleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(particleAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showAnimation, unlocked]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      style={[styles.container, { width: badgeSize + 16 }, style]}
      onPress={onPress}
      disabled={!unlocked}
      activeOpacity={unlocked ? 0.8 : 1}
    >
      {/* Badge icon */}
      <Animated.View
        style={[
          styles.badgeIcon,
          {
            width: badgeSize,
            height: badgeSize,
            backgroundColor: unlocked ? color : theme.colors.background.secondary,
            borderColor: unlocked ? color : theme.colors.text.disabled.light,
            transform: [
              { scale: scaleAnim },
              { rotate: rotation },
            ],
          },
        ]}
      >
        <Text style={[styles.icon, { fontSize: iconSize }]}>
          {unlocked ? icon : '🔒'}
        </Text>
        
        {/* Shine effect for unlocked */}
        {unlocked && (
          <Animated.View
            style={[
              styles.shine,
              {
                opacity: particleAnim,
              },
            ]}
          />
        )}
      </Animated.View>

      {/* Progress ring for locked badges */}
      {!unlocked && progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      )}

      {/* Rarity label */}
      <Text
        style={[
          styles.rarity,
          { color: unlocked ? color : theme.colors.text.secondary.light },
        ]}
      >
        {rarityLabels[rarity]}
      </Text>

      {/* Name */}
      <Text
        style={[
          styles.name,
          {
            color: unlocked
              ? theme.colors.text.primary.light
              : theme.colors.text.secondary.light,
          },
        ]}
        numberOfLines={2}
        textAlign="center"
      >
        {name}
      </Text>

      {/* Description (optional) */}
      {description && unlocked && (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
  },
  badgeIcon: {
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 8,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  icon: {
    textAlign: 'center',
  },
  shine: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.3)',
    transform: [{ rotate: '45deg' }],
  },
  progressContainer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  progressTrack: {
    width: 50,
    height: 4,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: 10,
    color: theme.colors.text.secondary.light,
    marginTop: 2,
  },
  rarity: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  description: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
    marginTop: 4,
  },
});

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { theme } from '@rangexp/theme';
import { Icon, IconName } from './Icon';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface AchievementCardProps {
  icon: IconName;
  name: string;
  description: string;
  rarity: AchievementRarity;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  xpReward?: number;
}

// Calculate card width to fit 3 cards with gaps
const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = theme.spacing.lg * 2;
const GAP = theme.spacing.sm;
export const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING - GAP * 2) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

const rarityColors: Record<AchievementRarity, string> = {
  common: theme.colors.gamification.achievement,
  rare: theme.colors.gamification.rare,
  epic: theme.colors.gamification.epic,
  legendary: theme.colors.gamification.legendary,
};

const rarityLabels: Record<AchievementRarity, string> = {
  common: 'Bronce',
  rare: 'Plata',
  epic: 'Oro',
  legendary: 'Platino',
};

const rarityIcons: Record<AchievementRarity, IconName> = {
  common: 'medal',
  rare: 'star',
  epic: 'crown-simple',
  legendary: 'crown',
};

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function AchievementCard({
  icon,
  name,
  description,
  rarity,
  unlocked,
  unlockedAt,
  progress,
  xpReward,
}: AchievementCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const borderColor = unlocked ? rarityColors[rarity] : theme.colors.text.disabled.light;
  const iconColor = unlocked ? rarityColors[rarity] : theme.colors.text.disabled.light;

  const handleFlip = () => {
    if (!unlocked) return;

    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  // Interpolations for flip animation
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '90deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-90deg', '-90deg', '0deg'],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <TouchableOpacity
      activeOpacity={unlocked ? 0.9 : 1}
      onPress={handleFlip}
      style={styles.container}
    >
      {/* Front Side */}
      <Animated.View
        style={[
          styles.card,
          styles.cardFront,
          { borderColor },
          {
            transform: [{ rotateY: frontInterpolate }],
            opacity: frontOpacity,
          },
          !unlocked && styles.cardLocked,
        ]}
      >
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: unlocked
                ? `${rarityColors[rarity]}15`
                : theme.colors.background.light.secondary,
            },
          ]}
        >
          <Icon
            name={unlocked ? icon : 'lock'}
            size={28}
            color={iconColor}
            weight={unlocked ? 'duotone' : 'regular'}
          />
        </View>

        {/* Name */}
        <Text
          style={[
            styles.name,
            { color: unlocked ? theme.colors.text.primary.light : theme.colors.text.disabled.light },
          ]}
          numberOfLines={2}
        >
          {name}
        </Text>

        {/* Progress bar for locked achievements */}
        {!unlocked && progress !== undefined && progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progress, 100)}%`, backgroundColor: rarityColors[rarity] },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        )}

        {/* Rarity indicator dot */}
        {unlocked && (
          <View style={[styles.rarityDot, { backgroundColor: rarityColors[rarity] }]} />
        )}
      </Animated.View>

      {/* Back Side */}
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          { borderColor, backgroundColor: `${rarityColors[rarity]}10` },
          {
            transform: [{ rotateY: backInterpolate }],
            opacity: backOpacity,
          },
        ]}
      >
        {/* Rarity badge */}
        <View style={[styles.rarityBadge, { backgroundColor: rarityColors[rarity] }]}>
          <Icon name={rarityIcons[rarity]} size={12} color="#FFFFFF" weight="fill" />
          <Text style={styles.rarityText}>{rarityLabels[rarity]}</Text>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {description}
        </Text>

        {/* XP Reward */}
        {xpReward && xpReward > 0 && (
          <View style={styles.xpContainer}>
            <Icon name="lightning" size={12} color={theme.colors.gamification.xp} weight="fill" />
            <Text style={styles.xpText}>+{xpReward} XP</Text>
          </View>
        )}

        {/* Unlock date */}
        {unlockedAt && (
          <View style={styles.dateContainer}>
            <Icon name="calendar" size={10} color={theme.colors.text.secondary.light} />
            <Text style={styles.dateText}>{formatDate(unlockedAt)}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    padding: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    ...theme.shadows.soft,
  },
  cardFront: {
    backgroundColor: theme.colors.background.light.card,
  },
  cardBack: {
    backgroundColor: theme.colors.background.light.card,
  },
  cardLocked: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  name: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  progressContainer: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    left: theme.spacing.sm,
    right: theme.spacing.sm,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 8,
    color: theme.colors.text.secondary.light,
    marginTop: 2,
  },
  rarityDot: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    gap: 2,
    marginBottom: theme.spacing.xs,
  },
  rarityText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  description: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: 10,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 13,
    flex: 1,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: theme.spacing.xs,
  },
  xpText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.gamification.xp,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: theme.spacing.xs,
  },
  dateText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: 9,
    color: theme.colors.text.secondary.light,
  },
});

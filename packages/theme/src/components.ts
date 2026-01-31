// RangeXp Component Library Preview
// Componentes base para React Native - Production Ready

import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { theme } from './index';

// ============================================================================
// BUTTONS
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const buttonStyles = {
  primary: {
    backgroundColor: theme.colors.primary,
    textColor: '#FFFFFF',
  },
  secondary: {
    backgroundColor: 'transparent',
    textColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: theme.colors.text.secondary.light,
    borderColor: 'transparent',
  },
  success: {
    backgroundColor: theme.colors.gamification.achievement,
    textColor: '#FFFFFF',
  },
  danger: {
    backgroundColor: theme.colors.states.error,
    textColor: '#FFFFFF',
  },
};

const buttonSizes = {
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: theme.typography.fontSize.sm,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    fontSize: theme.typography.fontSize.base,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    fontSize: theme.typography.fontSize.lg,
  },
};

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}: ButtonProps) {
  const styles = buttonStyles[variant];
  const sizeStyles = buttonSizes[size];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: styles.backgroundColor,
          borderWidth: variant === 'secondary' ? 2 : 0,
          borderColor: styles.borderColor,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.5 : 1,
        },
        theme.shadows.soft,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={styles.textColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconMargin}>{icon}</View>}
          <Text style={[styles.text, { color: styles.textColor, fontSize: sizeStyles.fontSize }]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// REX COMPONENT
// ============================================================================

export type RexMood = 'happy' | 'celebrate' | 'support' | 'neutral' | 'sleeping';
export type RexSize = 'small' | 'medium' | 'large' | 'xl';

interface RexProps {
  mood?: RexMood;
  size?: RexSize;
  interactive?: boolean;
  showSpeechBubble?: boolean;
  message?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

const moodConfig = {
  happy: {
    color: theme.colors.rex.body,
    glowColor: theme.colors.rex.happy,
    animation: 'bounce',
  },
  celebrate: {
    color: theme.colors.rex.celebrate,
    glowColor: theme.colors.rex.celebrate,
    animation: 'spin',
  },
  support: {
    color: theme.colors.rex.support,
    glowColor: theme.colors.rex.support,
    animation: 'pulse',
  },
  neutral: {
    color: theme.colors.rex.neutral,
    glowColor: theme.colors.rex.body,
    animation: 'float',
  },
  sleeping: {
    color: theme.colors.rex.sleeping,
    glowColor: theme.colors.rex.body,
    animation: 'none',
  },
};

const rexSizes = {
  small: { width: 60, height: 80 },
  medium: { width: 80, height: 110 },
  large: { width: 120, height: 160 },
  xl: { width: 160, height: 220 },
};

export function Rex({
  mood = 'happy',
  size = 'medium',
  interactive = false,
  showSpeechBubble = false,
  message,
  onPress,
  style,
}: RexProps) {
  const config = moodConfig[mood];
  const dimensions = rexSizes[size];

  // Animación base (simplificada - usar Reanimated en producción)
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (!interactive || !onPress) return;
    
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    
    onPress();
  };

  return (
    <View style={[styles.rexContainer, style]}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.rexGlow,
          {
            width: dimensions.width,
            height: dimensions.height,
            backgroundColor: config.glowColor,
            opacity: 0.3,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />
      
      {/* Rex body */}
      <TouchableOpacity
        style={[
          styles.rexBody,
          {
            width: dimensions.width,
            height: dimensions.height,
            backgroundColor: config.color,
            borderRadius: dimensions.width * 0.3,
          },
        ]}
        onPress={handlePress}
        disabled={!interactive}
        activeOpacity={0.8}
      >
        {/* Eyes based on mood */}
        {mood === 'happy' && (
          <View style={styles.rexEyesHappy}>
            <View style={styles.rexEye} />
            <View style={styles.rexEye} />
          </View>
        )}
        
        {mood === 'celebrate' && (
          <View style={styles.rexEyesCelebrate}>
            <View style={styles.rexEyeClosed} />
            <View style={styles.rexEyeClosed} />
          </View>
        )}
        
        {mood === 'support' && (
          <View style={styles.rexEyesSupport}>
            <View style={[styles.rexEye, { width: 12, height: 12 }]} />
            <View style={[styles.rexEye, { width: 12, height: 12 }]} />
          </View>
        )}
        
        {mood === 'neutral' && (
          <View style={styles.rexEyesNeutral}>
            <View style={styles.rexEyeHalf} />
            <View style={styles.rexEyeHalf} />
          </View>
        )}
        
        {mood === 'sleeping' && (
          <View style={styles.rexEyesSleeping}>
            <View style={styles.rexEyeClosed} />
            <View style={styles.rexEyeClosed} />
          </View>
        )}
        
        {/* Mouth based on mood */}
        <View style={[styles.rexMouth, moodStyles[mood]]} />
        
        {/* Cheeks */}
        <View style={styles.rexCheeks}>
          <View style={styles.rexCheek} />
          <View style={styles.rexCheek} />
        </View>
      </TouchableOpacity>
      
      {/* Speech bubble */}
      {showSpeechBubble && message && (
        <View style={styles.speechBubble}>
          <Text style={styles.speechBubbleText}>{message}</Text>
        </View>
      )}
    </View>
  );
}

const moodStyles = {
  happy: styles.rexMouthHappy,
  celebrate: styles.rexMouthCelebrate,
  support: styles.rexMouthSupport,
  neutral: styles.rexMouthNeutral,
  sleeping: styles.rexMouthSleeping,
};

// ============================================================================
// ACHIEVEMENT BADGE
// ============================================================================

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface AchievementBadgeProps {
  icon: string;
  name: string;
  rarity: BadgeRarity;
  unlocked: boolean;
  description?: string;
  progress?: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
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
}: AchievementBadgeProps) {
  const badgeSize = size === 'small' ? 60 : size === 'medium' ? 80 : 120;
  const color = rarityColors[rarity];

  return (
    <TouchableOpacity
      style={[styles.badgeContainer, { width: badgeSize }]}
      onPress={onPress}
      disabled={!unlocked}
      activeOpacity={unlocked ? 0.8 : 1}
    >
      {/* Badge icon */}
      <View
        style={[
          styles.badgeIcon,
          {
            width: badgeSize,
            height: badgeSize,
            backgroundColor: unlocked ? color : theme.colors.background.secondary,
            borderColor: unlocked ? color : theme.colors.text.disabled.light,
          },
        ]}
      >
        <Text style={[styles.badgeEmoji, { fontSize: badgeSize * 0.4 }]}>
          {unlocked ? icon : '🔒'}
        </Text>
      </View>
      
      {/* Progress ring for locked badges */}
      {!unlocked && progress !== undefined && (
        <View style={styles.badgeProgress}>
          <Text style={styles.badgeProgressText}>{progress}%</Text>
        </View>
      )}
      
      {/* Rarity label */}
      <Text
        style={[
          styles.badgeRarity,
          { color: unlocked ? color : theme.colors.text.secondary.light },
        ]}
      >
        {rarityLabels[rarity]}
      </Text>
      
      {/* Name */}
      <Text
        style={[
          styles.badgeName,
          { color: unlocked ? theme.colors.text.primary.light : theme.colors.text.secondary.light },
        ]}
        numberOfLines={2}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// XP PROGRESS BAR
// ============================================================================

interface XpProgressBarProps {
  currentXp: number;
  nextLevelXp: number;
  level: number;
  showDetails?: boolean;
  animated?: boolean;
}

export function XpProgressBar({
  currentXp,
  nextLevelXp,
  level,
  showDetails = true,
  animated = true,
}: XpProgressBarProps) {
  const progress = Math.min(currentXp / nextLevelXp, 1);
  const xpToNext = nextLevelXp - currentXp;

  return (
    <View style={styles.xpBarContainer}>
      {/* Level badge */}
      <View style={styles.xpLevelBadge}>
        <Text style={styles.xpLevelText}>{level}</Text>
      </View>
      
      {/* Progress bar */}
      <View style={styles.xpBarTrack}>
        <Animated.View
          style={[
            styles.xpBarFill,
            {
              width: animated ? `${progress * 100}%` : `${progress * 100}%`,
              backgroundColor: theme.colors.gamification.xp,
            },
          ]}
        />
      </View>
      
      {/* Details */}
      {showDetails && (
        <View style={styles.xpDetails}>
          <Text style={styles.xpCurrent}>{currentXp} XP</Text>
          <Text style={styles.xpRemaining}>{xpToNext} para siguiente nivel</Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// GLUCOSE CARD
// ============================================================================

export type GlucoseStatus = 'low' | 'normal' | 'high';

interface GlucoseCardProps {
  value: number;
  unit: 'mg/dL' | 'mmol/L';
  status: GlucoseStatus;
  timestamp: string;
  notes?: string;
  trend?: 'up' | 'down' | 'stable';
  onPress?: () => void;
}

const glucoseConfig = {
  low: {
    color: theme.colors.glucose.low,
    label: 'Bajo',
    icon: '📉',
  },
  normal: {
    color: theme.colors.glucose.normal,
    label: 'En rango',
    icon: '✅',
  },
  high: {
    color: theme.colors.glucose.high,
    label: 'Alto',
    icon: '📈',
  },
};

export function GlucoseCard({
  value,
  unit,
  status,
  timestamp,
  notes,
  trend,
  onPress,
}: GlucoseCardProps) {
  const config = glucoseConfig[status];

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  return (
    <TouchableOpacity
      style={[
        styles.glucoseCard,
        { borderLeftColor: config.color },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.glucoseHeader}>
        <View style={[styles.glucoseStatus, { backgroundColor: config.color }]}>
          <Text style={styles.glucoseStatusText}>{config.label}</Text>
        </View>
        <Text style={styles.glucoseTime}>{timestamp}</Text>
      </View>
      
      {/* Value */}
      <View style={styles.glucoseValueRow}>
        <Text style={styles.glucoseValue}>{value}</Text>
        <Text style={styles.glucoseUnit}>{unit}</Text>
        {trend && (
          <Text style={[styles.glucoseTrend, { color: config.color }]}>
            {trendIcons[trend]}
          </Text>
        )}
      </View>
      
      {/* Notes */}
      {notes && (
        <Text style={styles.glucoseNotes} numberOfLines={2}>
          {notes}
        </Text>
      )}
      
      {/* Rex reaction */}
      <View style={styles.glucoseRex}>
        <Rex
          mood={status === 'normal' ? 'happy' : 'support'}
          size="small"
        />
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// ACTIVITY FEED ITEM
// ============================================================================

export type ActivityType = 'glucose' | 'achievement' | 'streak' | 'level' | 'friend';

interface ActivityFeedItemProps {
  type: ActivityType;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  likes?: number;
  comments?: number;
  onLike?: () => void;
  onComment?: () => void;
  onPress?: () => void;
}

const activityConfig = {
  glucose: { icon: '🩸', color: theme.colors.glucose.normal },
  achievement: { icon: '🏆', color: theme.colors.gamification.achievement },
  streak: { icon: '🔥', color: theme.colors.gamification.streak },
  level: { icon: '⬆️', color: theme.colors.primary },
  friend: { icon: '👋', color: theme.colors.rex.support },
};

export function ActivityFeedItem({
  type,
  userId,
  userName,
  userAvatar,
  content,
  timestamp,
  likes = 0,
  comments = 0,
  onLike,
  onComment,
  onPress,
}: ActivityFeedItemProps) {
  const config = activityConfig[type];

  return (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* User avatar or icon */}
      <View style={styles.activityAvatar}>
        {userAvatar ? (
          <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: config.color }]}>
            <Text style={styles.avatarText}>{userName[0]}</Text>
          </View>
        )}
      </View>
      
      {/* Content */}
      <View style={styles.activityContent}>
        <Text style={styles.activityUser}>{userName}</Text>
        <Text style={styles.activityText}>{content}</Text>
        <Text style={styles.activityTime}>{timestamp}</Text>
        
        {/* Actions */}
        <View style={styles.activityActions}>
          <TouchableOpacity
            style={styles.activityAction}
            onPress={onLike}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.activityActionIcon}>❤️</Text>
            {likes > 0 && (
              <Text style={styles.activityActionText}>{likes}</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.activityAction}
            onPress={onComment}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.activityActionIcon}>💬</Text>
            {comments > 0 && (
              <Text style={styles.activityActionText}>{comments}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Type icon */}
      <View style={[styles.activityTypeIcon, { backgroundColor: config.color }]}>
        <Text style={styles.typeIconEmoji}>{config.icon}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Button styles
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconMargin: {
    marginRight: 8,
  },
  text: {
    fontFamily: theme.typography.fontFamily.body,
    fontWeight: '600',
  },
  
  // Rex styles
  rexContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rexGlow: {
    position: 'absolute',
    borderRadius: 9999,
    blurRadius: 20,
  },
  rexBody: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rexEyesHappy: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 25,
  },
  rexEye: {
    width: 10,
    height: 10,
    backgroundColor: theme.colors.text.primary.light,
    borderRadius: 5,
  },
  rexEyesCelebrate: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 25,
  },
  rexEyeClosed: {
    width: 14,
    height: 8,
    borderTopWidth: 2,
    borderTopColor: theme.colors.text.primary.light,
    borderRadius: 4,
  },
  rexEyesSupport: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 22,
  },
  rexEyesNeutral: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 25,
  },
  rexEyeHalf: {
    width: 10,
    height: 5,
    backgroundColor: theme.colors.text.primary.light,
    borderRadius: 2,
  },
  rexEyesSleeping: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 25,
  },
  rexMouth: {
    position: 'absolute',
    bottom: 25,
  },
  rexMouthHappy: {
    width: 20,
    height: 10,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.text.primary.light,
    borderRadius: 10,
  },
  rexMouthCelebrate: {
    width: 24,
    height: 12,
    backgroundColor: theme.colors.text.primary.light,
    borderRadius: 6,
  },
  rexMouthSupport: {
    width: 16,
    height: 6,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.text.primary.light,
    borderRadius: 8,
  },
  rexMouthNeutral: {
    width: 12,
    height: 4,
    backgroundColor: theme.colors.text.primary.light,
    borderRadius: 2,
  },
  rexMouthSleeping: {
    width: 16,
    height: 6,
    backgroundColor: theme.colors.text.primary.light,
    borderRadius: 3,
  },
  rexCheeks: {
    flexDirection: 'row',
    gap: 24,
    position: 'absolute',
    bottom: 15,
  },
  rexCheek: {
    width: 8,
    height: 4,
    backgroundColor: 'rgba(236, 72, 153, 0.3)',
    borderRadius: 2,
  },
  speechBubble: {
    position: 'absolute',
    top: -40,
    backgroundColor: theme.colors.background.light.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.soft,
  },
  speechBubbleText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary.light,
  },
  
  // Badge styles
  badgeContainer: {
    alignItems: 'center',
    padding: 8,
  },
  badgeIcon: {
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  badgeEmoji: {
    textAlign: 'center',
  },
  badgeProgress: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: theme.colors.background.light.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.soft,
  },
  badgeProgressText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary.light,
  },
  badgeRarity: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  badgeName: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  
  // XP Bar styles
  xpBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  xpLevelBadge: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.rex,
  },
  xpLevelText: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.lg,
    color: '#FFFFFF',
  },
  xpBarTrack: {
    flex: 1,
    height: 12,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  xpDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  xpCurrent: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gamification.xp,
    fontWeight: '600',
  },
  xpRemaining: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  
  // Glucose Card styles
  glucoseCard: {
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    ...theme.shadows.card,
  },
  glucoseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  glucoseStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  glucoseStatusText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  glucoseTime: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary.light,
  },
  glucoseValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  glucoseValue: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 32,
    color: theme.colors.text.primary.light,
    fontWeight: '700',
  },
  glucoseUnit: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  glucoseTrend: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    marginLeft: 8,
  },
  glucoseNotes: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    marginTop: 8,
    fontStyle: 'italic',
  },
  glucoseRex: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  
  // Activity Feed Item styles
  activityItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  activityAvatar: {
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.lg,
    color: '#FFFFFF',
  },
  activityContent: {
    flex: 1,
  },
  activityUser: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
  },
  activityText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    marginTop: 2,
  },
  activityTime: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled.light,
    marginTop: 4,
  },
  activityActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  activityAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityActionIcon: {
    fontSize: 16,
  },
  activityActionText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  activityTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  typeIconEmoji: {
    fontSize: 16,
  },
});

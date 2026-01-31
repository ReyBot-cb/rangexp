import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ViewStyle } from 'react-native';
import { theme } from '@rangexp/theme';

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
  style?: ViewStyle;
}

const activityConfig = {
  glucose: {
    icon: '🩸',
    color: theme.colors.glucose.normal,
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  achievement: {
    icon: '🏆',
    color: theme.colors.gamification.achievement,
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  streak: {
    icon: '🔥',
    color: theme.colors.gamification.streak,
    bgColor: 'rgba(249, 115, 22, 0.1)',
  },
  level: {
    icon: '⬆️',
    color: theme.colors.primary,
    bgColor: 'rgba(124, 58, 237, 0.1)',
  },
  friend: {
    icon: '👋',
    color: theme.colors.rex.support,
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
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
  style,
}: ActivityFeedItemProps) {
  const config = activityConfig[type];

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* User avatar */}
      <View style={styles.avatarContainer}>
        {userAvatar ? (
          <Image source={{ uri: userAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: config.color }]}>
            <Text style={styles.avatarText}>{userName[0]}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
        
        <Text style={styles.activityContent}>{content}</Text>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.action}
            onPress={onLike}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.actionIcon}>❤️</Text>
            {likes > 0 && (
              <Text style={styles.actionText}>{likes}</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.action}
            onPress={onComment}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.actionIcon}>💬</Text>
            {comments > 0 && (
              <Text style={styles.actionText}>{comments}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Type indicator */}
      <View style={[styles.typeBadge, { backgroundColor: config.bgColor }]}>
        <Text style={styles.typeIcon}>{config.icon}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.lg,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
  },
  timestamp: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled.light,
  },
  activityContent: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  typeBadge: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  typeIcon: {
    fontSize: 18,
  },
});

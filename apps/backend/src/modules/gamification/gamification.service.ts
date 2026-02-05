import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddXpDto } from './dto/gamification.dto';
import { AchievementsService } from '../achievements/achievements.service';
import { AchievementTrigger } from '../achievements/constants/categories';
import { GAMIFICATION } from '@rangexp/types';

@Injectable()
export class GamificationService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AchievementsService))
    private achievementsService: AchievementsService,
  ) {}

  async addXp(userId: string, dto: AddXpDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const newXp = user.xp + dto.amount;
    const newLevel = this.calculateLevel(newXp);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
      },
      select: {
        id: true,
        xp: true,
        level: true,
        streak: true,
      },
    });

    // Check for level up achievements
    if (newLevel > user.level) {
      await this.achievementsService.checkAchievementsByTrigger(
        userId,
        AchievementTrigger.LEVEL_UP,
        {
          oldLevel: user.level,
          newLevel,
        },
      );
    }

    return {
      xp: updatedUser.xp,
      level: updatedUser.level,
      xpGained: dto.amount,
      reason: dto.reason,
    };
  }

  async updateStreak(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, lastActiveAt: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;

    let newStreak = user.streak;
    let previousStreak: number | undefined;

    if (!lastActive) {
      // First activity
      newStreak = 1;
    } else {
      const diffDays = Math.floor(
        (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 0) {
        // Same day - ensure streak is at least 1
        newStreak = Math.max(user.streak, 1);
      } else if (diffDays === 1) {
        // Consecutive day
        newStreak = user.streak + 1;
      } else {
        // Streak broken - save the old streak for potential recovery
        if (user.streak > 0) {
          previousStreak = user.streak;
        }
        newStreak = 1;
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        lastActiveAt: now,
        ...(previousStreak !== undefined && { previousStreak }),
      },
      select: {
        id: true,
        streak: true,
        lastActiveAt: true,
      },
    });

    return {
      streak: updatedUser.streak,
      streakChanged: updatedUser.streak !== user.streak,
      streakLost: previousStreak !== undefined,
    };
  }

  async recoverStreak(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        previousStreak: true,
        lastActiveAt: true,
        isPremium: true,
        premiumExpiresAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is premium
    const isPremiumActive =
      user.isPremium &&
      (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date());

    if (!isPremiumActive) {
      throw new Error('Premium subscription required to recover streak');
    }

    // Check if there's a streak to recover
    if (user.previousStreak === 0) {
      throw new Error('No streak available to recover');
    }

    // Check if recovery window is still valid (within 3 days of losing streak)
    const now = new Date();
    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;

    if (lastActive) {
      const daysSinceLost = Math.floor(
        (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSinceLost > 3) {
        throw new Error('Recovery window expired (max 3 days)');
      }
    }

    // Recover the streak
    const recoveredStreak = user.previousStreak + 1; // +1 for today

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        streak: recoveredStreak,
        previousStreak: 0, // Clear the saved streak
        lastActiveAt: now,
      },
      select: {
        id: true,
        streak: true,
        lastActiveAt: true,
      },
    });

    // Check streak recovery achievement
    await this.achievementsService.checkAchievementsByTrigger(
      userId,
      AchievementTrigger.STREAK_RECOVERED,
      { eventName: 'STREAK_RECOVERED', recoveredStreak },
    );

    return {
      streak: updatedUser.streak,
      recovered: true,
      message: `Streak recovered! You're now on a ${updatedUser.streak} day streak.`,
    };
  }

  async getStreakRecoveryStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        previousStreak: true,
        lastActiveAt: true,
        isPremium: true,
        premiumExpiresAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isPremiumActive =
      user.isPremium &&
      (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date());

    const canRecover = user.previousStreak > 0 && isPremiumActive;

    let daysRemaining = 0;
    if (user.lastActiveAt && user.previousStreak > 0) {
      const daysSinceLost = Math.floor(
        (new Date().getTime() - new Date(user.lastActiveAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      daysRemaining = Math.max(0, 3 - daysSinceLost);
    }

    return {
      canRecover,
      previousStreak: user.previousStreak,
      currentStreak: user.streak,
      daysRemaining,
      isPremium: isPremiumActive,
    };
  }

  calculateLevel(xp: number): number {
    // Simple level formula: Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 250 XP, etc.
    // Each level requires more XP than the previous
    if (xp < 100) return 1;

    let level = 1;
    let xpThreshold = 100;

    while (xp >= xpThreshold) {
      level++;
      xpThreshold = Math.floor(xpThreshold * 1.5);
    }

    return level;
  }

  async onGlucoseLogged(userId: string, readingId: string) {
    // Add XP for logging glucose
    await this.addXp(userId, {
      amount: GAMIFICATION.XP.GLUCOSE_LOG,
      reason: 'LOG_READING',
    });

    // Update streak
    const streakResult = await this.updateStreak(userId);

    // Check achievements using trigger-based system
    // This will evaluate all achievements in REGISTROS, CONTEXTOS, CONTROL, ESPECIALES categories
    await this.achievementsService.checkAchievementsByTrigger(
      userId,
      AchievementTrigger.GLUCOSE_LOGGED,
      { readingId },
    );

    // Check streak-related achievements if streak changed
    if (streakResult.streakChanged) {
      await this.achievementsService.checkAchievementsByTrigger(
        userId,
        AchievementTrigger.STREAK_UPDATED,
        { streak: streakResult.streak },
      );
    }

    return streakResult;
  }

  async onFriendAdded(userId: string, friendId: string) {
    // Check social achievements
    await this.achievementsService.checkAchievementsByTrigger(
      userId,
      AchievementTrigger.FRIEND_ADDED,
      { friendId },
    );
  }

  async onPremiumActivated(userId: string) {
    // Check premium-related achievements
    await this.achievementsService.checkAchievementsByTrigger(
      userId,
      AchievementTrigger.PREMIUM_ACTIVATED,
      { eventName: 'PREMIUM_ACTIVATED' },
    );
  }

  async onShareCompleted(userId: string) {
    // Check share-related achievements
    await this.achievementsService.checkAchievementsByTrigger(
      userId,
      AchievementTrigger.SHARE_COMPLETED,
      {},
    );
  }

  async onEncouragementSent(userId: string, receiverId: string) {
    // Check encouragement-related achievements
    await this.achievementsService.checkAchievementsByTrigger(
      userId,
      AchievementTrigger.ENCOURAGEMENT_SENT,
      { receiverId },
    );
  }

  async onAchievementUnlocked(
    userId: string,
    achievementCode: string,
    xpReward: number,
  ) {
    if (xpReward > 0) {
      await this.addXp(userId, {
        amount: xpReward,
        reason: `ACHIEVEMENT_${achievementCode}`,
      });
    }

    return { success: true, achievementCode, xpReward };
  }

  async getLevelInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const xpForNextLevel = this.getXpForLevel(user.level + 1);
    const xpInCurrentLevel = user.xp - this.getXpForLevel(user.level);
    const xpNeededForNextLevel = xpForNextLevel - user.xp;

    return {
      currentLevel: user.level,
      currentXp: user.xp,
      xpForNextLevel,
      xpInCurrentLevel,
      xpNeededForNextLevel,
      progressPercentage: Math.min(
        Math.round(
          (xpInCurrentLevel / (xpForNextLevel - this.getXpForLevel(user.level))) *
            100,
        ),
        100,
      ),
    };
  }

  getXpForLevel(level: number): number {
    if (level <= 1) return 0;

    let xp = 0;
    let threshold = 100;

    for (let i = 2; i <= level; i++) {
      xp += threshold;
      threshold = Math.floor(threshold * 1.5);
    }

    return xp;
  }
}

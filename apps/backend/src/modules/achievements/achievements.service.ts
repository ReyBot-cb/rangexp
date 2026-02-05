import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { SocialService } from '../social/social.service';
import { ConditionEvaluatorService } from './evaluators/condition-evaluator.service';
import { ACHIEVEMENT_SEEDS } from './data/achievement-seeds';
import { AchievementTrigger, TRIGGER_CATEGORIES } from './constants/categories';
import { AchievementCondition, AchievementCategory } from './types/condition.types';

export interface AchievementWithProgress {
  id: string;
  code: string;
  name: string;
  description: string;
  xpReward: number;
  tier: string;
  category: string;
  unlocked: boolean;
  unlockedAt: Date | null;
  progress: number | null;
  target: number | null;
  progressPercentage: number | null;
}

@Injectable()
export class AchievementsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => GamificationService))
    private gamificationService: GamificationService,
    @Inject(forwardRef(() => SocialService))
    private socialService: SocialService,
    private conditionEvaluator: ConditionEvaluatorService,
  ) {}

  async findAll() {
    return this.prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByCode(code: string) {
    return this.prisma.achievement.findUnique({
      where: { code },
    });
  }

  async findByCategory(category: AchievementCategory) {
    return this.prisma.achievement.findMany({
      where: { category },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getUserAchievements(userId: string) {
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });

    const allAchievements = await this.prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const achievements = allAchievements.map((achievement) => {
      const userAchievement = userAchievements.find(
        (ua) => ua.achievementId === achievement.id,
      );

      return {
        ...achievement,
        unlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt || null,
      };
    });

    const totalXpFromAchievements = userAchievements.reduce(
      (sum, ua) => sum + ua.achievement.xpReward,
      0,
    );

    return {
      achievements,
      totalUnlocked: userAchievements.length,
      totalAchievements: allAchievements.length,
      totalXpFromAchievements,
    };
  }

  // Get achievements with progress for a user
  async getUserAchievementsWithProgress(userId: string): Promise<{
    achievements: AchievementWithProgress[];
    totalUnlocked: number;
    totalAchievements: number;
    totalXpFromAchievements: number;
    byCategory: Record<string, AchievementWithProgress[]>;
  }> {
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });

    const allAchievements = await this.prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    const achievements: AchievementWithProgress[] = await Promise.all(
      allAchievements.map(async (achievement) => {
        const userAchievement = userAchievements.find(
          (ua) => ua.achievementId === achievement.id,
        );
        const unlocked = !!userAchievement;

        let progress: number | null = null;
        let target: number | null = null;
        let progressPercentage: number | null = null;

        // Calculate progress for locked achievements
        if (!unlocked && achievement.condition) {
          try {
            const result = await this.conditionEvaluator.evaluate(
              userId,
              achievement.condition as unknown as AchievementCondition,
            );
            progress = result.progress ?? null;
            target = result.target ?? null;
            progressPercentage = result.progressPercentage ?? null;
          } catch {
            // Ignore errors in progress calculation
          }
        }

        return {
          id: achievement.id,
          code: achievement.code,
          name: achievement.name,
          description: achievement.description,
          xpReward: achievement.xpReward,
          tier: achievement.tier,
          category: achievement.category,
          unlocked,
          unlockedAt: userAchievement?.unlockedAt || null,
          progress: unlocked ? target : progress,
          target,
          progressPercentage: unlocked ? 100 : progressPercentage,
        };
      }),
    );

    // Group by category
    const byCategory: Record<string, AchievementWithProgress[]> = {};
    for (const achievement of achievements) {
      if (!byCategory[achievement.category]) {
        byCategory[achievement.category] = [];
      }
      byCategory[achievement.category].push(achievement);
    }

    const totalXpFromAchievements = userAchievements.reduce(
      (sum, ua) => sum + ua.achievement.xpReward,
      0,
    );

    return {
      achievements,
      totalUnlocked: userAchievements.length,
      totalAchievements: allAchievements.length,
      totalXpFromAchievements,
      byCategory,
    };
  }

  // Check achievements by trigger (new method)
  async checkAchievementsByTrigger(
    userId: string,
    trigger: AchievementTrigger,
    eventData?: Record<string, unknown>,
  ) {
    const categories = TRIGGER_CATEGORIES[trigger] || [];
    const results: Array<{
      code: string;
      unlocked: boolean;
      xpReward?: number;
    }> = [];

    // Get all achievements in the relevant categories
    const achievements = await this.prisma.achievement.findMany({
      where: {
        category: { in: categories },
      },
    });

    for (const achievement of achievements) {
      // Check if already unlocked
      const existing = await this.prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
      });

      if (existing) {
        continue;
      }

      // Evaluate condition
      const result = await this.conditionEvaluator.evaluate(
        userId,
        achievement.condition as unknown as AchievementCondition,
        eventData,
      );

      if (result.met) {
        // Unlock the achievement
        await this.unlockAchievement(userId, achievement);
        results.push({
          code: achievement.code,
          unlocked: true,
          xpReward: achievement.xpReward,
        });
      }
    }

    return results;
  }

  // Check and unlock a specific achievement (for backwards compatibility)
  async checkAndUnlockAchievement(
    userId: string,
    code: string,
    eventData?: Record<string, unknown>,
  ) {
    const achievement = await this.findByCode(code);
    if (!achievement) {
      return { alreadyUnlocked: false, achievement: null };
    }

    // Check if already unlocked
    const existing = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (existing) {
      return { alreadyUnlocked: true, achievement: null };
    }

    // Evaluate condition
    const result = await this.conditionEvaluator.evaluate(
      userId,
      achievement.condition as unknown as AchievementCondition,
      eventData,
    );

    if (!result.met) {
      return { alreadyUnlocked: false, achievement: null };
    }

    // Unlock achievement
    const unlockedAchievement = await this.unlockAchievement(userId, achievement);

    return {
      alreadyUnlocked: false,
      achievement: unlockedAchievement,
      xpReward: achievement.xpReward,
    };
  }

  // Internal method to unlock an achievement
  private async unlockAchievement(
    userId: string,
    achievement: {
      id: string;
      code: string;
      name: string;
      tier: string;
      xpReward: number;
    },
  ) {
    const userAchievement = await this.prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
      },
      include: {
        achievement: true,
      },
    });

    // Award XP
    if (achievement.xpReward > 0) {
      await this.gamificationService.onAchievementUnlocked(
        userId,
        achievement.code,
        achievement.xpReward,
      );
    }

    // Post to activity feed
    await this.socialService.postActivity(userId, null, 'UNLOCK_ACHIEVEMENT', {
      message: `Desbloqueaste: ${achievement.name}`,
      achievement: {
        code: achievement.code,
        name: achievement.name,
        tier: achievement.tier,
        xpReward: achievement.xpReward,
      },
    });

    return userAchievement.achievement;
  }

  // Seed all 37 achievements
  async seedAchievements() {
    let seeded = 0;
    let updated = 0;

    for (const achievement of ACHIEVEMENT_SEEDS) {
      const existing = await this.prisma.achievement.findUnique({
        where: { code: achievement.code },
      });

      if (existing) {
        await this.prisma.achievement.update({
          where: { code: achievement.code },
          data: {
            name: achievement.name,
            description: achievement.description,
            xpReward: achievement.xpReward,
            tier: achievement.tier,
            category: achievement.category,
            condition: achievement.condition as object,
          },
        });
        updated++;
      } else {
        await this.prisma.achievement.create({
          data: {
            code: achievement.code,
            name: achievement.name,
            description: achievement.description,
            xpReward: achievement.xpReward,
            tier: achievement.tier,
            category: achievement.category,
            condition: achievement.condition as object,
          },
        });
        seeded++;
      }
    }

    return { seeded, updated, total: ACHIEVEMENT_SEEDS.length };
  }
}

import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AddXpDto } from "./dto/gamification.dto";
import { AchievementsService } from "../achievements/achievements.service";

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
      throw new Error("User not found");
    }

    const newXp = user.xp + dto.amount;
    const newLevel = this.calculateLevel(newXp);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
        lastActiveAt: new Date(),
      },
      select: {
        id: true,
        xp: true,
        level: true,
        streak: true,
      },
    });

    // Check for level up achievement
    if (newLevel > user.level) {
      await this.achievementsService.checkAndUnlockAchievement(userId, "LEVEL_UP", {
        oldLevel: user.level,
        newLevel,
      });
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
      throw new Error("User not found");
    }

    const now = new Date();
    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;

    let newStreak = user.streak;

    if (!lastActive) {
      // First activity
      newStreak = 1;
    } else {
      const diffDays = Math.floor(
        (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 0) {
        // Same day, no streak change
        newStreak = user.streak;
      } else if (diffDays === 1) {
        // Consecutive day
        newStreak = user.streak + 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        lastActiveAt: now,
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
    };
  }

  calculateLevel(xp: number): number {
    // Simple level formula: Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 250 XP, etc.
    // Each level requires more XP than the previous
    if (xp < 100) return 1;
    
    let level = 1;
    let xpRequired = 0;
    let xpThreshold = 100;

    while (xp >= xpThreshold) {
      level++;
      xpRequired += xpThreshold;
      xpThreshold = Math.floor(xpThreshold * 1.5);
    }

    return level;
  }

  async onGlucoseLogged(userId: string, readingId: string) {
    // Add XP for logging glucose
    await this.addXp(userId, { amount: 5, reason: "LOG_READING" });

    // Update streak
    const streakResult = await this.updateStreak(userId);

    // Check achievements
    await this.achievementsService.checkAndUnlockAchievement(userId, "FIRST_LOG", {
      readingId,
    });

    await this.achievementsService.checkAndUnlockAchievement(userId, "7_READINGS_DAY", {
      userId,
    });

    if (streakResult.streak === 7) {
      await this.achievementsService.checkAndUnlockAchievement(userId, "WEEK_STREAK");
    }

    if (streakResult.streak === 30) {
      await this.achievementsService.checkAndUnlockAchievement(userId, "MONTH_STREAK");
    }

    return streakResult;
  }

  async onAchievementUnlocked(userId: string, achievementCode: string, xpReward: number) {
    if (xpReward > 0) {
      await this.addXp(userId, { amount: xpReward, reason: `ACHIEVEMENT_${achievementCode}` });
    }

    return { success: true, achievementCode, xpReward };
  }

  async getLevelInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });

    if (!user) {
      throw new Error("User not found");
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
        Math.round((xpInCurrentLevel / (xpForNextLevel - this.getXpForLevel(user.level))) * 100),
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

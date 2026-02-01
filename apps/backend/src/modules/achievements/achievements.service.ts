import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GamificationService } from "../gamification/gamification.service";
import { SocialService } from "../social/social.service";

@Injectable()
export class AchievementsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => GamificationService))
    private gamificationService: GamificationService,
    @Inject(forwardRef(() => SocialService))
    private socialService: SocialService,
  ) {}

  async findAll() {
    return this.prisma.achievement.findMany({
      orderBy: { createdAt: "asc" },
    });
  }

  async findByCode(code: string) {
    return this.prisma.achievement.findUnique({
      where: { code },
    });
  }

  async getUserAchievements(userId: string) {
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: "desc" },
    });

    const allAchievements = await this.prisma.achievement.findMany({
      orderBy: { createdAt: "asc" },
    });

    const unlockedCodes = new Set(userAchievements.map((ua) => ua.achievement.code));

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

  async checkAndUnlockAchievement(
    userId: string,
    code: string,
    eventData?: Record<string, any>,
  ) {
    // Check if already unlocked
    const existing = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: (await this.findByCode(code))?.id || "",
        },
      },
    });

    if (existing) {
      return { alreadyUnlocked: true, achievement: null };
    }

    const achievement = await this.findByCode(code);
    if (!achievement) {
      return { alreadyUnlocked: false, achievement: null };
    }

    // Check if condition is met
    const isUnlocked = await this.checkCondition(userId, code, eventData);
    if (!isUnlocked) {
      return { alreadyUnlocked: false, achievement: null };
    }

    // Unlock achievement
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
        code,
        achievement.xpReward,
      );
    }

    // Post to activity feed
    await this.socialService.postActivity(userId, null, "UNLOCK_ACHIEVEMENT", {
      message: `🏆 Desbloqueaste: ${achievement.name}`,
      achievement: {
        code: achievement.code,
        name: achievement.name,
        tier: achievement.tier,
        xpReward: achievement.xpReward,
      },
    });

    return {
      alreadyUnlocked: false,
      achievement: userAchievement.achievement,
      xpReward: achievement.xpReward,
    };
  }

  private async checkCondition(
    userId: string,
    code: string,
    eventData?: Record<string, any>,
  ): Promise<boolean> {
    switch (code) {
      case "FIRST_LOG":
        return true; // Already logged reading

      case "WEEK_STREAK":
        const streak7 = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { streak: true },
        });
        return (streak7?.streak || 0) >= 7;

      case "MONTH_STREAK":
        const streak30 = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { streak: true },
        });
        return (streak30?.streak || 0) >= 30;

      case "7_READINGS_DAY": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = await this.prisma.glucoseReading.count({
          where: {
            userId,
            recordedAt: { gte: today },
          },
        });
        return count >= 7;
      }

      case "FIRST_FRIEND": {
        const friendsCount = await this.prisma.friendship.count({
          where: {
            OR: [{ requesterId: userId }, { receiverId: userId }],
            status: "accepted",
          },
        });
        return friendsCount >= 1;
      }

      case "LEVEL_UP":
        return true; // Already checked in gamification service

      default:
        return false;
    }
  }

  async seedAchievements() {
    const achievements = [
      {
        code: "FIRST_LOG",
        name: "Primer Registro",
        description: "Registra tu primera glucemia",
        xpReward: 50,
        tier: "bronze",
        condition: {},
      },
      {
        code: "WEEK_STREAK",
        name: "Una Semana de Constancia",
        description: "Mantén tu racha por 7 días",
        xpReward: 100,
        tier: "silver",
        condition: {},
      },
      {
        code: "MONTH_STREAK",
        name: "Mes de Disciplina",
        description: "Mantén tu racha por 30 días",
        xpReward: 500,
        tier: "gold",
        condition: {},
      },
      {
        code: "7_READINGS_DAY",
        name: "Seguimiento Intensivo",
        description: "Registra 7 glucemias en un día",
        xpReward: 75,
        tier: "silver",
        condition: {},
      },
      {
        code: "FIRST_FRIEND",
        name: "Nuevos Amigos",
        description: "Añade tu primer amigo",
        xpReward: 50,
        tier: "bronze",
        condition: {},
      },
      {
        code: "LEVEL_UP",
        name: "Subida de Nivel",
        description: "Sube de nivel",
        xpReward: 25,
        tier: "bronze",
        condition: {},
      },
    ];

    for (const achievement of achievements) {
      await this.prisma.achievement.upsert({
        where: { code: achievement.code },
        update: achievement,
        create: achievement,
      });
    }

    return { seeded: achievements.length };
  }
}

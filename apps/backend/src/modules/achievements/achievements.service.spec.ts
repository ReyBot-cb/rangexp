import { Test, TestingModule } from "@nestjs/testing";
import { AchievementsService } from "./achievements.service";
import { PrismaService } from "../../prisma/prisma.service";
import { GamificationService } from "../gamification/gamification.service";
import { SocialService } from "../social/social.service";

describe("AchievementsService", () => {
  let service: AchievementsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    achievement: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    userAchievement: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    glucoseReading: {
      count: jest.fn(),
    },
    friendship: {
      count: jest.fn(),
    },
  };

  const mockGamificationService = {
    onAchievementUnlocked: jest.fn(),
  };

  const mockSocialService = {
    postActivity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: GamificationService, useValue: mockGamificationService },
        { provide: SocialService, useValue: mockSocialService },
      ],
    }).compile();

    service = module.get<AchievementsService>(AchievementsService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all achievements", async () => {
      const mockAchievements = [
        { id: "1", code: "FIRST_LOG", name: "First Log", description: "Test" },
        { id: "2", code: "WEEK_STREAK", name: "Week Streak", description: "Test" },
      ];

      mockPrisma.achievement.findMany.mockResolvedValue(mockAchievements);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].code).toBe("FIRST_LOG");
    });
  });

  describe("findByCode", () => {
    it("should return achievement by code", async () => {
      mockPrisma.achievement.findUnique.mockResolvedValue({
        id: "1",
        code: "FIRST_LOG",
        name: "First Log",
        description: "First glucose reading",
      });

      const result = await service.findByCode("FIRST_LOG");

      expect(result?.code).toBe("FIRST_LOG");
    });

    it("should return null for non-existent code", async () => {
      mockPrisma.achievement.findUnique.mockResolvedValue(null);

      const result = await service.findByCode("NON_EXISTENT");

      expect(result).toBeNull();
    });
  });

  describe("getUserAchievements", () => {
    it("should return achievements with unlock status", async () => {
      mockPrisma.userAchievement.findMany.mockResolvedValue([
        {
          id: "1",
          achievementId: "ach1",
          unlockedAt: new Date(),
          achievement: {
            id: "ach1",
            code: "FIRST_LOG",
            name: "First Log",
            xpReward: 50,
          },
        },
      ]);
      mockPrisma.achievement.findMany.mockResolvedValue([
        { id: "ach1", code: "FIRST_LOG", name: "First Log", xpReward: 50 },
        { id: "ach2", code: "WEEK_STREAK", name: "Week Streak", xpReward: 100 },
      ]);

      const result = await service.getUserAchievements("user-1");

      expect(result.totalUnlocked).toBe(1);
      expect(result.totalAchievements).toBe(2);
      expect(result.achievements).toHaveLength(2);
      expect(result.achievements[0].unlocked).toBe(true);
      expect(result.achievements[1].unlocked).toBe(false);
    });
  });

  describe("checkAndUnlockAchievement", () => {
    it("should return alreadyUnlocked if achievement is already unlocked", async () => {
      mockPrisma.userAchievement.findUnique.mockResolvedValue({
        id: "1",
        userId: "user-1",
        achievementId: "ach-1",
      });
      mockPrisma.achievement.findUnique.mockResolvedValue({
        id: "ach-1",
        code: "FIRST_LOG",
      });

      const result = await service.checkAndUnlockAchievement("user-1", "FIRST_LOG");

      expect(result.alreadyUnlocked).toBe(true);
      expect(result.achievement).toBeNull();
    });

    it("should unlock achievement if condition is met", async () => {
      mockPrisma.userAchievement.findUnique.mockResolvedValue(null);
      mockPrisma.achievement.findUnique.mockResolvedValue({
        id: "ach-1",
        code: "FIRST_LOG",
        name: "First Log",
        xpReward: 50,
        tier: "bronze",
      });
      mockPrisma.userAchievement.create.mockResolvedValue({
        id: "1",
        achievementId: "ach-1",
        unlockedAt: new Date(),
        achievement: {
          id: "ach-1",
          code: "FIRST_LOG",
          name: "First Log",
          xpReward: 50,
        },
      });

      const result = await service.checkAndUnlockAchievement("user-1", "FIRST_LOG");

      expect(result.alreadyUnlocked).toBe(false);
      expect(result.achievement?.code).toBe("FIRST_LOG");
    });
  });

  describe("seedAchievements", () => {
    it("should seed all achievements", async () => {
      mockPrisma.achievement.upsert.mockResolvedValue({} as any);

      const result = await service.seedAchievements();

      expect(result.seeded).toBe(6); // 6 achievement types
    });
  });
});

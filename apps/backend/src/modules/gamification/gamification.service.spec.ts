import { Test, TestingModule } from "@nestjs/testing";
import { GamificationService } from "./gamification.service";
import { PrismaService } from "../../prisma/prisma.service";
import { AchievementsService } from "../achievements/achievements.service";

describe("GamificationService", () => {
  let service: GamificationService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAchievementsService = {
    checkAndUnlockAchievement: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AchievementsService, useValue: mockAchievementsService },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe("calculateLevel", () => {
    it("should return level 1 for XP < 100", () => {
      expect(service.calculateLevel(50)).toBe(1);
      expect(service.calculateLevel(99)).toBe(1);
    });

    it("should return level 2 for XP >= 100 and < 150", () => {
      expect(service.calculateLevel(100)).toBe(2);
      expect(service.calculateLevel(149)).toBe(2);
    });

    it("should return level 3 for XP >= 150 and < 225", () => {
      // Algorithm: threshold starts at 100, then 150, then 225...
      expect(service.calculateLevel(150)).toBe(3);
      expect(service.calculateLevel(224)).toBe(3);
    });

    it("should return level 4 for XP >= 225", () => {
      expect(service.calculateLevel(225)).toBe(4);
      expect(service.calculateLevel(249)).toBe(4);
      expect(service.calculateLevel(336)).toBe(4);
    });
  });

  describe("getXpForLevel", () => {
    it("should return 0 for level 1", () => {
      expect(service.getXpForLevel(1)).toBe(0);
    });

    it("should return 100 XP for level 2", () => {
      expect(service.getXpForLevel(2)).toBe(100);
    });

    it("should return cumulative XP for higher levels", () => {
      // Level 3 = 100 + 150 = 250 XP
      expect(service.getXpForLevel(3)).toBe(250);
      // Level 4 = 100 + 150 + 225 = 475 XP
      expect(service.getXpForLevel(4)).toBe(475);
    });
  });

  describe("addXp", () => {
    it("should add XP and calculate new level", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        xp: 50,
        level: 1,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: "user-1",
        xp: 60,
        level: 1,
        streak: 0,
      });

      const result = await service.addXp("user-1", { amount: 10, reason: "TEST" });

      expect(result.xp).toBe(60);
      expect(result.xpGained).toBe(10);
    });

    it("should level up when XP threshold is reached", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        xp: 90,
        level: 1,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: "user-1",
        xp: 100,
        level: 2,
        streak: 0,
      });

      const result = await service.addXp("user-1", { amount: 10, reason: "TEST" });

      expect(result.level).toBe(2);
    });
  });

  describe("updateStreak", () => {
    it("should set streak to 1 for first activity", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        streak: 0,
        lastActiveAt: null,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: "user-1",
        streak: 1,
        lastActiveAt: new Date(),
      });

      const result = await service.updateStreak("user-1");

      expect(result.streak).toBe(1);
      expect(result.streakChanged).toBe(true);
    });

    it("should increment streak for consecutive day", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        streak: 5,
        lastActiveAt: yesterday,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: "user-1",
        streak: 6,
        lastActiveAt: new Date(),
      });

      const result = await service.updateStreak("user-1");

      expect(result.streak).toBe(6);
    });

    it("should reset streak after gap day", async () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        streak: 5,
        lastActiveAt: twoDaysAgo,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: "user-1",
        streak: 1,
        lastActiveAt: new Date(),
      });

      const result = await service.updateStreak("user-1");

      expect(result.streak).toBe(1);
    });

    it("should not change streak for same day activity", async () => {
      const today = new Date();
      today.setHours(today.getHours() - 2); // 2 hours ago, same day

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        streak: 5,
        lastActiveAt: today,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: "user-1",
        streak: 5,
        lastActiveAt: new Date(),
      });

      const result = await service.updateStreak("user-1");

      expect(result.streak).toBe(5);
      expect(result.streakChanged).toBe(false);
    });

    it("should reset streak after 3 days gap", async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        streak: 10,
        lastActiveAt: threeDaysAgo,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: "user-1",
        streak: 1,
        lastActiveAt: new Date(),
      });

      const result = await service.updateStreak("user-1");

      expect(result.streak).toBe(1);
      expect(result.streakChanged).toBe(true);
    });

    it("should handle long streaks correctly", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        streak: 100,
        lastActiveAt: yesterday,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: "user-1",
        streak: 101,
        lastActiveAt: new Date(),
      });

      const result = await service.updateStreak("user-1");

      expect(result.streak).toBe(101);
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { AchievementsController } from "./achievements.controller";
import { AchievementsService } from "./achievements.service";

describe("AchievementsController", () => {
  let controller: AchievementsController;
  let achievementsService: jest.Mocked<AchievementsService>;

  const mockAchievementsService = {
    findAll: jest.fn(),
    getUserAchievements: jest.fn(),
    seedAchievements: jest.fn(),
  };

  const mockAchievements = [
    {
      id: "first-reading",
      code: "FIRST_READING",
      name: "First Step",
      description: "Record your first glucose reading",
      icon: "🩸",
      rarity: "common",
      xpReward: 50,
    },
    {
      id: "week-streak",
      code: "WEEK_STREAK",
      name: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: "🔥",
      rarity: "rare",
      xpReward: 100,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementsController],
      providers: [
        { provide: AchievementsService, useValue: mockAchievementsService },
      ],
    }).compile();

    controller = module.get<AchievementsController>(AchievementsController);
    achievementsService = module.get(AchievementsService);

    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all achievements", async () => {
      mockAchievementsService.findAll.mockResolvedValue(mockAchievements);

      const result = await controller.findAll();

      expect(result).toEqual(mockAchievements);
      expect(mockAchievementsService.findAll).toHaveBeenCalled();
    });

    it("should return empty array if no achievements", async () => {
      mockAchievementsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("getMyAchievements", () => {
    it("should return user achievements with unlock status", async () => {
      const req = { user: { id: "user-1" } };
      const userAchievements = [
        { ...mockAchievements[0], unlocked: true, unlockedAt: "2024-01-15T10:00:00Z" },
        { ...mockAchievements[1], unlocked: false, progress: 5 },
      ];

      mockAchievementsService.getUserAchievements.mockResolvedValue(userAchievements);

      const result = await controller.getMyAchievements(req);

      expect(result).toEqual(userAchievements);
      expect(mockAchievementsService.getUserAchievements).toHaveBeenCalledWith("user-1");
    });

    it("should include progress for locked achievements", async () => {
      const req = { user: { id: "user-1" } };
      const userAchievements = [
        { ...mockAchievements[1], unlocked: false, progress: 5, targetValue: 7 },
      ];

      mockAchievementsService.getUserAchievements.mockResolvedValue(userAchievements);

      const result = await controller.getMyAchievements(req);

      expect(result[0].progress).toBe(5);
      expect(result[0].unlocked).toBe(false);
    });
  });

  describe("seedAchievements", () => {
    it("should seed achievements database", async () => {
      const expectedResult = {
        message: "Achievements seeded successfully",
        count: 15,
      };

      mockAchievementsService.seedAchievements.mockResolvedValue(expectedResult);

      const result = await controller.seedAchievements();

      expect(result).toEqual(expectedResult);
      expect(mockAchievementsService.seedAchievements).toHaveBeenCalled();
    });
  });
});

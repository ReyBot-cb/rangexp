import { Test, TestingModule } from "@nestjs/testing";
import { GamificationController } from "./gamification.controller";
import { GamificationService } from "./gamification.service";

describe("GamificationController", () => {
  let controller: GamificationController;
  let gamificationService: jest.Mocked<GamificationService>;

  const mockGamificationService = {
    addXp: jest.fn(),
    getLevelInfo: jest.fn(),
    updateStreak: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamificationController],
      providers: [
        { provide: GamificationService, useValue: mockGamificationService },
      ],
    }).compile();

    controller = module.get<GamificationController>(GamificationController);
    gamificationService = module.get(GamificationService);

    jest.clearAllMocks();
  });

  describe("addXp", () => {
    it("should add XP to user", async () => {
      const req = { user: { id: "user-1" } };
      const addXpDto = { amount: 50, reason: "glucose_reading" };
      const expectedResult = {
        xp: 550,
        level: 5,
        xpGained: 50,
        reason: "glucose_reading",
      };

      mockGamificationService.addXp.mockResolvedValue(expectedResult);

      const result = await controller.addXp(req, addXpDto);

      expect(result).toEqual(expectedResult);
      expect(mockGamificationService.addXp).toHaveBeenCalledWith("user-1", addXpDto);
    });

    it("should return xpGained in response", async () => {
      const req = { user: { id: "user-1" } };
      const addXpDto = { amount: 100, reason: "achievement" };
      const expectedResult = {
        xp: 600,
        level: 6,
        xpGained: 100,
        reason: "achievement",
      };

      mockGamificationService.addXp.mockResolvedValue(expectedResult);

      const result = await controller.addXp(req, addXpDto);

      expect(result.xpGained).toBe(100);
    });
  });

  describe("getLevelInfo", () => {
    it("should return level information", async () => {
      const req = { user: { id: "user-1" } };
      const expectedResult = {
        currentLevel: 5,
        currentXp: 500,
        xpForNextLevel: 600,
        progressPercentage: 83,
        xpNeededForNextLevel: 100,
      };

      mockGamificationService.getLevelInfo.mockResolvedValue(expectedResult);

      const result = await controller.getLevelInfo(req);

      expect(result).toEqual(expectedResult);
      expect(mockGamificationService.getLevelInfo).toHaveBeenCalledWith("user-1");
    });
  });

  describe("updateStreak", () => {
    it("should update user streak", async () => {
      const req = { user: { id: "user-1" } };
      const expectedResult = {
        streak: 8,
        streakChanged: true,
      };

      mockGamificationService.updateStreak.mockResolvedValue(expectedResult);

      const result = await controller.updateStreak(req);

      expect(result).toEqual(expectedResult);
      expect(mockGamificationService.updateStreak).toHaveBeenCalledWith("user-1");
    });
  });

  describe("getStats", () => {
    it("should return gamification stats", async () => {
      const req = { user: { id: "user-1" } };
      const levelInfo = {
        currentLevel: 5,
        currentXp: 500,
        xpForNextLevel: 600,
        progressPercentage: 83,
      };

      mockGamificationService.getLevelInfo.mockResolvedValue(levelInfo);

      const result = await controller.getStats(req);

      expect(result.currentLevel).toBe(5);
      expect(result.currentXp).toBe(500);
      expect(mockGamificationService.getLevelInfo).toHaveBeenCalledWith("user-1");
    });
  });
});

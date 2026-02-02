import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { GlucoseUnit, Theme, Language } from "../auth/dto/auth.dto";

describe("UserController", () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUserService = {
    getProfile: jest.fn(),
    updateSettings: jest.fn(),
    updateRex: jest.fn(),
    getStats: jest.fn(),
  };

  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    xp: 500,
    level: 5,
    streak: 7,
    isPremium: false,
    glucoseUnit: GlucoseUnit.MG_DL,
    rexCustomization: "default",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);

    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return user profile", async () => {
      const req = { user: { id: "user-1" } };

      mockUserService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(req);

      expect(result).toEqual(mockUser);
      expect(mockUserService.getProfile).toHaveBeenCalledWith("user-1");
    });
  });

  describe("updateSettings", () => {
    it("should update user settings", async () => {
      const req = { user: { id: "user-1" } };
      const updateDto = { glucoseUnit: GlucoseUnit.MMOL_L };
      const expectedResult = { ...mockUser, glucoseUnit: GlucoseUnit.MMOL_L };

      mockUserService.updateSettings.mockResolvedValue(expectedResult);

      const result = await controller.updateSettings(req, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockUserService.updateSettings).toHaveBeenCalledWith("user-1", updateDto);
    });

    it("should update theme setting", async () => {
      const req = { user: { id: "user-1" } };
      const updateDto = { theme: Theme.DARK };

      mockUserService.updateSettings.mockResolvedValue({ ...mockUser, theme: Theme.DARK });

      await controller.updateSettings(req, updateDto);

      expect(mockUserService.updateSettings).toHaveBeenCalledWith("user-1", updateDto);
    });
  });

  describe("updateRex", () => {
    it("should update Rex customization", async () => {
      const req = { user: { id: "user-1" } };
      const updateDto = { rexCustomization: "pirate" };
      const expectedResult = { ...mockUser, rexCustomization: "pirate" };

      mockUserService.updateRex.mockResolvedValue(expectedResult);

      const result = await controller.updateRex(req, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockUserService.updateRex).toHaveBeenCalledWith("user-1", updateDto);
    });
  });

  describe("getStats", () => {
    it("should return user gamification stats", async () => {
      const req = { user: { id: "user-1" } };
      const expectedStats = {
        xp: 500,
        level: 5,
        streak: 7,
        nextLevelXp: 600,
        progress: 83,
      };

      mockUserService.getStats.mockResolvedValue(expectedStats);

      const result = await controller.getStats(req);

      expect(result).toEqual(expectedStats);
      expect(mockUserService.getStats).toHaveBeenCalledWith("user-1");
    });
  });
});

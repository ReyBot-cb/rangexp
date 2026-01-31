import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("UserService", () => {
  let service: UserService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should throw NotFoundException if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile("non-existent")).rejects.toThrow(NotFoundException);
    });

    it("should return user profile", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@test.com",
        firstName: "John",
        lastName: "Doe",
        avatarUrl: null,
        xp: 100,
        level: 2,
        streak: 5,
        lastActiveAt: new Date(),
        glucoseUnit: "MG_DL",
        theme: "DARK",
        language: "ES",
        rexCustomization: "default",
        isPremium: false,
        premiumExpiresAt: null,
        createdAt: new Date(),
      });

      const result = await service.getProfile("user-1");

      expect(result.id).toBe("user-1");
      expect(result.level).toBe(2);
    });
  });

  describe("updateSettings", () => {
    it("should update user settings", async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: "user-1",
        glucoseUnit: "MMOL_L",
        theme: "DARK",
        language: "EN",
      });

      const result = await service.updateSettings("user-1", {
        glucoseUnit: "MMOL_L" as any,
        theme: "DARK" as any,
        language: "EN" as any,
      });

      expect(result.glucoseUnit).toBe("MMOL_L");
    });
  });

  describe("getStats", () => {
    it("should return user stats with level progress", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        xp: 150,
        level: 2,
        streak: 5,
        lastActiveAt: new Date(),
        createdAt: new Date("2024-01-01"),
      });

      const result = await service.getStats("user-1");

      expect(result.xp).toBe(150);
      expect(result.level).toBe(2);
      expect(result.streak).toBe(5);
      expect(result.xpProgress).toBe(50); // 150 % 100
      expect(result.xpNeeded).toBe(50); // 200 - 150
    });
  });

  describe("updateUser", () => {
    it("should update user XP, streak, and level", async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: "user-1",
        xp: 200,
        streak: 10,
        level: 3,
      });

      const result = await service.updateUser("user-1", {
        xp: 200,
        streak: 10,
        level: 3,
      });

      expect(result.xp).toBe(200);
      expect(result.level).toBe(3);
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ConflictException, UnauthorizedException, NotFoundException } from "@nestjs/common";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        JWT_SECRET: "test-secret",
        JWT_EXPIRES_IN: "15m",
        JWT_REFRESH_SECRET: "refresh-secret",
        JWT_REFRESH_EXPIRES_IN: "7d",
        BCRYPT_SALT_ROUNDS: 10,
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should throw ConflictException if email already exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1", email: "test@test.com" });

      await expect(
        service.register({ email: "test@test.com", password: "password123" }),
      ).rejects.toThrow(ConflictException);
    });

    it("should create user and return tokens", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-1",
        email: "test@test.com",
        firstName: "John",
        lastName: "Doe",
        xp: 0,
        level: 1,
        streak: 0,
        createdAt: new Date(),
      });
      mockJwtService.sign.mockReturnValue("access-token");

      const result = await service.register({
        email: "test@test.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      });

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });
  });

  describe("login", () => {
    it("should throw UnauthorizedException for invalid credentials", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: "test@test.com", password: "wrongpassword" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should return user and tokens on successful login", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@test.com",
        password: "hashedpassword",
        firstName: "John",
        lastName: "Doe",
        xp: 0,
        level: 1,
        streak: 0,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: "user-1",
        email: "test@test.com",
        firstName: "John",
        lastName: "Doe",
        xp: 0,
        level: 1,
        streak: 0,
      });
      mockJwtService.sign.mockReturnValue("access-token");

      const result = await service.login({ email: "test@test.com", password: "password123" });

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");
    });
  });

  describe("getProfile", () => {
    it("should throw NotFoundException if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile("non-existent-id")).rejects.toThrow(NotFoundException);
    });

    it("should return user profile", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@test.com",
        firstName: "John",
        lastName: "Doe",
        avatarUrl: null,
        xp: 0,
        level: 1,
        streak: 0,
        glucoseUnit: "MG_DL",
        theme: "LIGHT",
        language: "ES",
        rexCustomization: "default",
        isPremium: false,
        premiumExpiresAt: null,
        createdAt: new Date(),
      });

      const result = await service.getProfile("user-1");

      expect(result.id).toBe("user-1");
      expect(result.email).toBe("test@test.com");
    });
  });
});

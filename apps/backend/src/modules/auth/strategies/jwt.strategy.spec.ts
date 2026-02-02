import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { UnauthorizedException } from "@nestjs/common";
import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  let configService: jest.Mocked<ConfigService>;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    mockConfigService.get.mockReturnValue("test-jwt-secret");

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get(ConfigService);
  });

  describe("constructor", () => {
    it("should be defined", () => {
      expect(strategy).toBeDefined();
    });

    it("should get JWT_SECRET from config service", () => {
      expect(mockConfigService.get).toHaveBeenCalledWith("JWT_SECRET");
    });
  });

  describe("validate", () => {
    it("should return user object with id and email for valid payload", async () => {
      const payload = {
        sub: "user-123",
        email: "test@example.com",
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: "user-123",
        email: "test@example.com",
      });
    });

    it("should throw UnauthorizedException when sub is missing", async () => {
      const payload = {
        sub: "",
        email: "test@example.com",
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("should throw UnauthorizedException when sub is undefined", async () => {
      const payload = {
        sub: undefined as any,
        email: "test@example.com",
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("should throw UnauthorizedException with correct message", async () => {
      const payload = {
        sub: null as any,
        email: "test@example.com",
      };

      await expect(strategy.validate(payload)).rejects.toThrow("Invalid token");
    });

    it("should handle payload with additional fields", async () => {
      const payload = {
        sub: "user-123",
        email: "test@example.com",
        iat: 1234567890,
        exp: 1234567890,
        additionalField: "value",
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: "user-123",
        email: "test@example.com",
      });
    });
  });
});

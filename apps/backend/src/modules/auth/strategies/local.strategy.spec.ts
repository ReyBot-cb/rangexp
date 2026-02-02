import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { LocalStrategy } from "./local.strategy";
import { AuthService } from "../auth.service";

describe("LocalStrategy", () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService);

    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should be defined", () => {
      expect(strategy).toBeDefined();
    });
  });

  describe("validate", () => {
    it("should return user for valid credentials", async () => {
      const mockUser = {
        user: {
          id: "user-123",
          email: "test@example.com",
          firstName: "John",
        },
        token: "jwt-token",
      };

      mockAuthService.login.mockResolvedValue(mockUser);

      const result = await strategy.validate("test@example.com", "password123");

      expect(result).toEqual(mockUser);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should throw UnauthorizedException when login returns null", async () => {
      mockAuthService.login.mockResolvedValue(null);

      await expect(
        strategy.validate("test@example.com", "wrongpassword")
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException with correct message", async () => {
      mockAuthService.login.mockResolvedValue(null);

      await expect(
        strategy.validate("test@example.com", "wrongpassword")
      ).rejects.toThrow("Invalid credentials");
    });

    it("should call authService.login with correct parameters", async () => {
      const mockUser = { user: { id: "1" }, token: "token" };
      mockAuthService.login.mockResolvedValue(mockUser);

      await strategy.validate("user@test.com", "securepass");

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: "user@test.com",
        password: "securepass",
      });
    });

    it("should propagate errors from auth service", async () => {
      mockAuthService.login.mockRejectedValue(new Error("Service error"));

      await expect(
        strategy.validate("test@example.com", "password")
      ).rejects.toThrow("Service error");
    });
  });
});

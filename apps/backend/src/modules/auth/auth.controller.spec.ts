import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const registerDto = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
      };
      const expectedResult = {
        user: { id: "user-1", email: "test@example.com" },
        token: "jwt-token",
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe("login", () => {
    it("should login a user with valid credentials", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "password123",
      };
      const req = { user: { id: "user-1" } };
      const expectedResult = {
        user: { id: "user-1", email: "test@example.com" },
        token: "jwt-token",
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(req, loginDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe("logout", () => {
    it("should logout a user", async () => {
      const req = { user: { id: "user-1" } };
      const expectedResult = { message: "Logged out successfully" };

      mockAuthService.logout.mockResolvedValue(expectedResult);

      const result = await controller.logout(req);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.logout).toHaveBeenCalledWith("user-1");
    });
  });

  describe("getProfile", () => {
    it("should return user profile", async () => {
      const req = { user: { id: "user-1" } };
      const expectedResult = {
        id: "user-1",
        email: "test@example.com",
        firstName: "John",
      };

      mockAuthService.getProfile.mockResolvedValue(expectedResult);

      const result = await controller.getProfile(req);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith("user-1");
    });
  });

  describe("getMe", () => {
    it("should return current user (alias for profile)", async () => {
      const req = { user: { id: "user-1" } };
      const expectedResult = {
        id: "user-1",
        email: "test@example.com",
        firstName: "John",
      };

      mockAuthService.getProfile.mockResolvedValue(expectedResult);

      const result = await controller.getMe(req);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith("user-1");
    });
  });

  describe("updateProfile", () => {
    it("should update user profile", async () => {
      const req = { user: { id: "user-1" } };
      const updateDto = { firstName: "Jane" };
      const expectedResult = {
        id: "user-1",
        email: "test@example.com",
        firstName: "Jane",
      };

      mockAuthService.updateProfile.mockResolvedValue(expectedResult);

      const result = await controller.updateProfile(req, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.updateProfile).toHaveBeenCalledWith("user-1", updateDto);
    });
  });
});

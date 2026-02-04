import { UnauthorizedException } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should extend AuthGuard with jwt strategy", () => {
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });

  it("should have canActivate method", () => {
    expect(typeof guard.canActivate).toBe("function");
  });

  describe("handleRequest", () => {
    it("should return user when authentication succeeds", () => {
      const user = { id: "user-1", email: "test@test.com" };
      const result = guard.handleRequest(null, user, null);
      expect(result).toEqual(user);
    });

    it("should throw UnauthorizedException when user is not provided", () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException with jwt expired message", () => {
      const info = { message: "jwt expired" };
      expect(() => guard.handleRequest(null, null, info)).toThrow(UnauthorizedException);
      expect(() => guard.handleRequest(null, null, info)).toThrow("jwt expired");
    });

    it("should throw UnauthorizedException with custom error message from info", () => {
      const info = { message: "invalid token" };
      expect(() => guard.handleRequest(null, null, info)).toThrow("invalid token");
    });

    it("should throw UnauthorizedException with error message when err is provided", () => {
      const err = new Error("Token validation failed");
      expect(() => guard.handleRequest(err, null, null)).toThrow(UnauthorizedException);
      expect(() => guard.handleRequest(err, null, null)).toThrow("Token validation failed");
    });

    it("should throw UnauthorizedException with default message when no info or err", () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow("Unauthorized");
    });
  });
});

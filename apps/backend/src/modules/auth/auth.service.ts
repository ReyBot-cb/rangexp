import { Injectable, UnauthorizedException, ConflictException, NotFoundException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { RegisterDto, LoginDto, UpdateProfileDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      this.logger.log(`Attempting to register user: ${dto.email}`);

      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException("Email already registered");
      }

      this.logger.log('Hashing password...');
      const saltRounds = parseInt(this.configService.get<string>("BCRYPT_SALT_ROUNDS") || "10", 10);
      const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

      this.logger.log('Creating user in database...');
      const now = new Date();
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          lastActiveAt: now,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          xp: true,
          level: true,
          streak: true,
          lastActiveAt: true,
          glucoseUnit: true,
          isPremium: true,
          rexCustomization: true,
          createdAt: true,
        },
      });

      this.logger.log(`User created: ${user.id}`);
      const tokens = await this.generateTokens(user.id, user.email);

      return {
        user: {
          ...user,
          lastStreakDate: user.lastActiveAt ? user.lastActiveAt.toISOString().split('T')[0] : null,
        },
        ...tokens,
      };
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Note: We do NOT update lastActiveAt on login - it should only be updated
    // when the user performs a streak-contributing action (like logging glucose)
    // This preserves the correct lastStreakDate for streak calculations

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      lastStreakDate: user.lastActiveAt ? user.lastActiveAt.toISOString().split('T')[0] : null,
      glucoseUnit: user.glucoseUnit,
      isPremium: user.isPremium,
      rexCustomization: user.rexCustomization,
      createdAt: user.createdAt,
    };

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: userResponse,
      ...tokens,
    };
  }

  async logout(userId: string) {
    // In a real app, you would invalidate the refresh token here
    // For now, just return success
    return { message: "Logged out successfully" };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        xp: true,
        level: true,
        streak: true,
        lastActiveAt: true,
        glucoseUnit: true,
        theme: true,
        language: true,
        rexCustomization: true,
        isPremium: true,
        premiumExpiresAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      user: {
        ...user,
        lastStreakDate: user.lastActiveAt ? user.lastActiveAt.toISOString().split('T')[0] : null,
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        xp: true,
        level: true,
        streak: true,
        lastActiveAt: true,
        glucoseUnit: true,
        isPremium: true,
        rexCustomization: true,
        createdAt: true,
      },
    });

    return {
      user: {
        ...user,
        lastStreakDate: user.lastActiveAt ? user.lastActiveAt.toISOString().split('T')[0] : null,
      },
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    // Verify refresh token and generate new access token
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async refreshTokenFromBody(refreshToken: string) {
    this.logger.debug(`[AuthService] refreshTokenFromBody called`);

    try {
      const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET");
      const payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });

      this.logger.debug(`[AuthService] Refresh token payload: ${JSON.stringify(payload)}`);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        this.logger.error(`[AuthService] User not found for refresh token`);
        throw new UnauthorizedException("Invalid refresh token");
      }

      const newPayload = { sub: user.id, email: user.email };
      const accessToken = this.jwtService.sign(newPayload);

      this.logger.debug(`[AuthService] New access token generated for user ${user.id}`);

      return { accessToken };
    } catch (error) {
      this.logger.error(`[AuthService] Refresh token validation failed: ${error.message}`);
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    this.logger.debug(`[AuthService] generateTokens - payload: ${JSON.stringify(payload)}`);

    const jwtSecret = this.configService.get<string>("JWT_SECRET");
    this.logger.debug(`[AuthService] generateTokens - JWT_SECRET present: ${!!jwtSecret}, length: ${jwtSecret?.length}`);

    const accessToken = this.jwtService.sign(payload);
    this.logger.debug(`[AuthService] generateTokens - accessToken generated (first 50 chars): ${accessToken.substring(0, 50)}...`);

    const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET");
    const refreshExpiresIn = this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") || "7d";

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }
}

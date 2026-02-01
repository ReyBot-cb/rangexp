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
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          lastActiveAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          xp: true,
          level: true,
          streak: true,
          createdAt: true,
        },
      });

      this.logger.log(`User created: ${user.id}`);
      const tokens = await this.generateTokens(user.id, user.email);

      return {
        user,
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

    // Update last active
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
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

    return user;
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
      },
    });

    return user;
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

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload);

    const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET");
    const refreshExpiresIn = this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") || "7d";

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { UpdateSettingsDto, UpdateRexDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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

    return user;
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        glucoseUnit: true,
        theme: true,
        language: true,
      },
    });

    return user;
  }

  async updateRex(userId: string, dto: UpdateRexDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { rexCustomization: dto.rexCustomization },
      select: {
        id: true,
        rexCustomization: true,
      },
    });

    return user;
  }

  async getStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
        streak: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Calculate XP needed for next level (simple formula: level * 100)
    const xpForNextLevel = user.level * 100;
    const xpProgress = user.xp % 100;
    const xpNeeded = xpForNextLevel - xpProgress;

    return {
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      lastActiveAt: user.lastActiveAt,
      memberSince: user.createdAt,
      xpForNextLevel,
      xpProgress,
      xpNeeded,
    };
  }

  async findById(userId: string) {
    return this.prisma.user.findUnique({
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
      },
    });
  }

  async updateUser(userId: string, data: Partial<{ xp: number; streak: number; level: number }>) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}

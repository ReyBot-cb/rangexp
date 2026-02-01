import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateNotificationDto, NotificationQueryDto } from "./dto/notification.dto";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data,
      },
    });

    return notification;
  }

  async findAll(userId: string, query: NotificationQueryDto) {
    const where: any = { userId };

    if (query.unreadOnly) {
      where.read = false;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(userId: string, id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    if (notification.userId !== userId) {
      throw new NotFoundException("Notification not found");
    }

    return notification;
  }

  async markAsRead(userId: string, id: string) {
    await this.findById(userId, id);

    const notification = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return notification;
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });

    return { message: "All notifications marked as read" };
  }

  async delete(userId: string, id: string) {
    await this.findById(userId, id);

    await this.prisma.notification.delete({
      where: { id },
    });

    return { message: "Notification deleted" };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  async createAchievementNotification(
    userId: string,
    achievementName: string,
    xpReward: number,
  ) {
    return this.create(userId, {
      type: "ACHIEVEMENT",
      title: "🏆 Logro Desbloqueado",
      message: `¡Felicidades! Has desbloqueado "${achievementName}" (+${xpReward} XP)`,
      data: { achievementName, xpReward },
    });
  }

  async createStreakReminderNotification(userId: string, currentStreak: number) {
    return this.create(userId, {
      type: "STREAK_REMINDER",
      title: "🔥 Mantén tu racha",
      message: `Llevas ${currentStreak} días consecutivos. ¡No pares!`,
      data: { currentStreak },
    });
  }
}

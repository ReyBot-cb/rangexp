import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsService } from "./notifications.service";
import { PrismaService } from "../../../prisma/prisma.service";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a notification", async () => {
      mockPrisma.notification.create.mockResolvedValue({
        id: "notif-1",
        userId: "user-1",
        type: "ACHIEVEMENT",
        title: "Achievement Unlocked",
        message: "You unlocked First Log",
        read: false,
        createdAt: new Date(),
      });

      const result = await service.create("user-1", {
        type: "ACHIEVEMENT",
        title: "Achievement Unlocked",
        message: "You unlocked First Log",
      });

      expect(result.type).toBe("ACHIEVEMENT");
      expect(result.title).toBe("Achievement Unlocked");
    });
  });

  describe("findAll", () => {
    it("should return all notifications", async () => {
      mockPrisma.notification.findMany.mockResolvedValue([
        { id: "1", type: "ACHIEVEMENT", read: false },
        { id: "2", type: "FRIEND_REQUEST", read: true },
      ]);

      const result = await service.findAll("user-1", { unreadOnly: false });

      expect(result).toHaveLength(2);
    });

    it("should filter unread only", async () => {
      mockPrisma.notification.findMany.mockResolvedValue([
        { id: "1", type: "ACHIEVEMENT", read: false },
      ]);

      await service.findAll("user-1", { unreadOnly: true });

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ read: false }) }),
      );
    });
  });

  describe("findById", () => {
    it("should throw NotFoundException if not found", async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.findById("user-1", "non-existent")).rejects.toThrow(
        "Notification not found",
      );
    });

    it("should throw NotFoundException if user mismatch", async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({
        id: "notif-1",
        userId: "other-user",
        type: "ACHIEVEMENT",
        title: "Test",
        message: "Test",
        read: false,
        data: null,
      });

      await expect(service.findById("user-1", "notif-1")).rejects.toThrow(
        "Notification not found",
      );
    });

    it("should return notification", async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({
        id: "notif-1",
        userId: "user-1",
        type: "ACHIEVEMENT",
        title: "Test",
        message: "Test",
        read: false,
        data: null,
        createdAt: new Date(),
      });

      const result = await service.findById("user-1", "notif-1");

      expect(result.id).toBe("notif-1");
    });
  });

  describe("markAsRead", () => {
    it("should mark notification as read", async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({
        id: "notif-1",
        userId: "user-1",
        type: "ACHIEVEMENT",
        title: "Test",
        message: "Test",
        read: false,
        data: null,
        createdAt: new Date(),
      });
      mockPrisma.notification.update.mockResolvedValue({
        id: "notif-1",
        userId: "user-1",
        type: "ACHIEVEMENT",
        title: "Test",
        message: "Test",
        read: true,
        data: null,
        createdAt: new Date(),
      });

      const result = await service.markAsRead("user-1", "notif-1");

      expect(result.read).toBe(true);
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all notifications as read", async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead("user-1");

      expect(result.message).toBe("All notifications marked as read");
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1", read: false },
          data: { read: true },
        }),
      );
    });
  });

  describe("getUnreadCount", () => {
    it("should return unread count", async () => {
      mockPrisma.notification.count.mockResolvedValue(3);

      const result = await service.getUnreadCount("user-1");

      expect(result).toBe(3);
    });
  });

  describe("createAchievementNotification", () => {
    it("should create achievement notification", async () => {
      mockPrisma.notification.create.mockResolvedValue({
        id: "notif-1",
        userId: "user-1",
        type: "ACHIEVEMENT",
        title: "🏆 Logro Desbloqueado",
        message: '¡Felicidades! Has desbloqueado "First Log" (+50 XP)',
        read: false,
        data: { achievementName: "First Log", xpReward: 50 },
        createdAt: new Date(),
      });

      const result = await service.createAchievementNotification(
        "user-1",
        "First Log",
        50,
      );

      expect(result.type).toBe("ACHIEVEMENT");
      expect(result.data?.xpReward).toBe(50);
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";

describe("NotificationsController", () => {
  let controller: NotificationsController;
  let notificationsService: jest.Mocked<NotificationsService>;

  const mockNotificationsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    delete: jest.fn(),
  };

  const mockNotification = {
    id: "notif-1",
    userId: "user-1",
    type: "achievement",
    title: "New Achievement!",
    body: "You earned the First Reading badge",
    read: false,
    createdAt: "2024-01-15T10:00:00Z",
    data: { achievementId: "first-reading" },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    notificationsService = module.get(NotificationsService);

    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return user notifications", async () => {
      const req = { user: { id: "user-1" } };
      const query = {};
      const notifications = [mockNotification];

      mockNotificationsService.findAll.mockResolvedValue(notifications);

      const result = await controller.findAll(req, query);

      expect(result).toEqual(notifications);
      expect(mockNotificationsService.findAll).toHaveBeenCalledWith("user-1", query);
    });

    it("should filter by unread only", async () => {
      const req = { user: { id: "user-1" } };
      const query = { unreadOnly: true };

      mockNotificationsService.findAll.mockResolvedValue([mockNotification]);

      await controller.findAll(req, query);

      expect(mockNotificationsService.findAll).toHaveBeenCalledWith("user-1", query);
    });
  });

  describe("getUnreadCount", () => {
    it("should return unread notifications count", async () => {
      const req = { user: { id: "user-1" } };

      mockNotificationsService.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount(req);

      expect(result).toEqual({ unreadCount: 5 });
      expect(mockNotificationsService.getUnreadCount).toHaveBeenCalledWith("user-1");
    });

    it("should return zero when no unread notifications", async () => {
      const req = { user: { id: "user-1" } };

      mockNotificationsService.getUnreadCount.mockResolvedValue(0);

      const result = await controller.getUnreadCount(req);

      expect(result).toEqual({ unreadCount: 0 });
    });
  });

  describe("findById", () => {
    it("should return a specific notification", async () => {
      const req = { user: { id: "user-1" } };

      mockNotificationsService.findById.mockResolvedValue(mockNotification);

      const result = await controller.findById(req, "notif-1");

      expect(result).toEqual(mockNotification);
      expect(mockNotificationsService.findById).toHaveBeenCalledWith("user-1", "notif-1");
    });
  });

  describe("markAsRead", () => {
    it("should mark a notification as read", async () => {
      const req = { user: { id: "user-1" } };
      const expectedResult = { ...mockNotification, read: true };

      mockNotificationsService.markAsRead.mockResolvedValue(expectedResult);

      const result = await controller.markAsRead(req, "notif-1");

      expect(result).toEqual(expectedResult);
      expect(result.read).toBe(true);
      expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith("user-1", "notif-1");
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all notifications as read", async () => {
      const req = { user: { id: "user-1" } };
      const expectedResult = { message: "All notifications marked as read", count: 5 };

      mockNotificationsService.markAllAsRead.mockResolvedValue(expectedResult);

      const result = await controller.markAllAsRead(req);

      expect(result).toEqual(expectedResult);
      expect(mockNotificationsService.markAllAsRead).toHaveBeenCalledWith("user-1");
    });
  });

  describe("delete", () => {
    it("should delete a notification", async () => {
      const req = { user: { id: "user-1" } };
      const expectedResult = { message: "Notification deleted" };

      mockNotificationsService.delete.mockResolvedValue(expectedResult);

      const result = await controller.delete(req, "notif-1");

      expect(result).toEqual(expectedResult);
      expect(mockNotificationsService.delete).toHaveBeenCalledWith("user-1", "notif-1");
    });
  });
});

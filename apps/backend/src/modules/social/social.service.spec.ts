import { Test, TestingModule } from "@nestjs/testing";
import { SocialService } from "./social.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("SocialService", () => {
  let service: SocialService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    friendship: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    activityFeed: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SocialService>(SocialService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe("sendFriendRequest", () => {
    it("should throw error if sending to self", async () => {
      await expect(
        service.sendFriendRequest("user-1", { receiverId: "user-1" }),
      ).rejects.toThrow("Cannot send friend request to yourself");
    });

    it("should throw error if receiver not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.sendFriendRequest("user-1", { receiverId: "non-existent" }),
      ).rejects.toThrow("User not found");
    });

    it("should throw error if request already exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-2", email: "test@test.com" });
      mockPrisma.friendship.findFirst.mockResolvedValue({
        id: "friendship-1",
        requesterId: "user-1",
        receiverId: "user-2",
        status: "pending",
      });

      await expect(
        service.sendFriendRequest("user-1", { receiverId: "user-2" }),
      ).rejects.toThrow("Friend request already sent");
    });

    it("should create friend request", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-2", email: "test@test.com" });
      mockPrisma.friendship.findFirst.mockResolvedValue(null);
      mockPrisma.friendship.create.mockResolvedValue({
        id: "friendship-1",
        requesterId: "user-1",
        receiverId: "user-2",
        status: "pending",
        requester: { id: "user-1", firstName: "John", lastName: "Doe", avatarUrl: null },
        receiver: { id: "user-2", firstName: "Jane", lastName: "Smith", avatarUrl: null },
      });

      const result = await service.sendFriendRequest("user-1", { receiverId: "user-2" });

      expect(result.status).toBe("pending");
    });
  });

  describe("getFriends", () => {
    it("should return list of friends", async () => {
      mockPrisma.friendship.findMany.mockResolvedValue([
        {
          id: "f1",
          requesterId: "user-1",
          receiverId: "user-2",
          updatedAt: new Date(),
          requester: { id: "user-1", firstName: "John", avatarUrl: null, xp: 100, level: 2 },
          receiver: { id: "user-2", firstName: "Jane", avatarUrl: null, xp: 150, level: 3 },
        },
      ]);

      const result = await service.getFriends("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe("Jane");
    });
  });

  describe("getActivityFeed", () => {
    it("should return paginated activity feed", async () => {
      mockPrisma.friendship.findMany.mockResolvedValue([
        { requesterId: "user-1", receiverId: "user-2" },
      ]);
      mockPrisma.activityFeed.findMany.mockResolvedValue([
        {
          id: "activity-1",
          senderId: "user-1",
          type: "LOG_READING",
          message: "Logged glucose",
          createdAt: new Date(),
          sender: { id: "user-1", firstName: "John", lastName: "Doe", avatarUrl: null },
        },
      ]);
      mockPrisma.activityFeed.count.mockResolvedValue(1);

      const result = await service.getActivityFeed("user-1", { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe("postActivity", () => {
    it("should create activity post", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1", firstName: "John" });
      mockPrisma.activityFeed.create.mockResolvedValue({
        id: "activity-1",
        senderId: "user-1",
        type: "LOG_READING",
        message: "Logged glucose",
        data: {},
        sender: { id: "user-1", firstName: "John", lastName: "Doe", avatarUrl: null },
      });

      const result = await service.postActivity("user-1", null, "LOG_READING", {
        message: "Logged glucose",
      });

      expect(result.type).toBe("LOG_READING");
    });
  });
});

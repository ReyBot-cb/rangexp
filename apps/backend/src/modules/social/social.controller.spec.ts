import { Test, TestingModule } from "@nestjs/testing";
import { SocialController } from "./social.controller";
import { SocialService } from "./social.service";
import { FriendshipStatus } from "./dto/social.dto";

describe("SocialController", () => {
  let controller: SocialController;
  let socialService: jest.Mocked<SocialService>;

  const mockSocialService = {
    sendFriendRequest: jest.fn(),
    respondToFriendRequest: jest.fn(),
    getFriends: jest.fn(),
    getPendingRequests: jest.fn(),
    removeFriend: jest.fn(),
    getActivityFeed: jest.fn(),
    postActivity: jest.fn(),
  };

  const mockFriend = {
    id: "friend-1",
    name: "Jane Doe",
    avatar: "https://example.com/avatar.jpg",
    level: 5,
    streak: 10,
  };

  const mockFriendRequest = {
    id: "request-1",
    fromUser: {
      id: "user-2",
      name: "Bob Smith",
      avatar: null,
    },
    createdAt: "2024-01-15T10:00:00Z",
  };

  const mockActivity = {
    id: "activity-1",
    type: "glucose",
    userId: "user-1",
    userName: "John Doe",
    content: "Recorded a glucose reading of 120 mg/dL",
    timestamp: "2024-01-15T10:00:00Z",
    likes: 5,
    comments: 2,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialController],
      providers: [
        { provide: SocialService, useValue: mockSocialService },
      ],
    }).compile();

    controller = module.get<SocialController>(SocialController);
    socialService = module.get(SocialService);

    jest.clearAllMocks();
  });

  describe("sendFriendRequest", () => {
    it("should send a friend request", async () => {
      const req = { user: { id: "user-1" } };
      const dto = { receiverId: "user-2" };
      const expectedResult = {
        message: "Friend request sent",
        requestId: "request-1",
      };

      mockSocialService.sendFriendRequest.mockResolvedValue(expectedResult);

      const result = await controller.sendFriendRequest(req, dto);

      expect(result).toEqual(expectedResult);
      expect(mockSocialService.sendFriendRequest).toHaveBeenCalledWith("user-1", dto);
    });
  });

  describe("respondToFriendRequest", () => {
    it("should accept a friend request", async () => {
      const req = { user: { id: "user-1" } };
      const dto = { status: FriendshipStatus.ACCEPTED };
      const expectedResult = {
        message: "Friend request accepted",
        friend: mockFriend,
      };

      mockSocialService.respondToFriendRequest.mockResolvedValue(expectedResult);

      const result = await controller.respondToFriendRequest(req, "request-1", dto);

      expect(result).toEqual(expectedResult);
      expect(mockSocialService.respondToFriendRequest).toHaveBeenCalledWith(
        "user-1",
        "request-1",
        dto
      );
    });

    it("should reject a friend request", async () => {
      const req = { user: { id: "user-1" } };
      const dto = { status: FriendshipStatus.REJECTED };
      const expectedResult = {
        message: "Friend request rejected",
      };

      mockSocialService.respondToFriendRequest.mockResolvedValue(expectedResult);

      const result = await controller.respondToFriendRequest(req, "request-1", dto);

      expect(result).toEqual(expectedResult);
    });
  });

  describe("getFriends", () => {
    it("should return list of friends", async () => {
      const req = { user: { id: "user-1" } };
      const friends = [mockFriend];

      mockSocialService.getFriends.mockResolvedValue(friends);

      const result = await controller.getFriends(req);

      expect(result).toEqual(friends);
      expect(mockSocialService.getFriends).toHaveBeenCalledWith("user-1");
    });

    it("should return empty array if no friends", async () => {
      const req = { user: { id: "user-1" } };

      mockSocialService.getFriends.mockResolvedValue([]);

      const result = await controller.getFriends(req);

      expect(result).toEqual([]);
    });
  });

  describe("getPendingRequests", () => {
    it("should return pending friend requests", async () => {
      const req = { user: { id: "user-1" } };
      const requests = [mockFriendRequest];

      mockSocialService.getPendingRequests.mockResolvedValue(requests);

      const result = await controller.getPendingRequests(req);

      expect(result).toEqual(requests);
      expect(mockSocialService.getPendingRequests).toHaveBeenCalledWith("user-1");
    });
  });

  describe("removeFriend", () => {
    it("should remove a friend", async () => {
      const req = { user: { id: "user-1" } };
      const expectedResult = { message: "Friend removed" };

      mockSocialService.removeFriend.mockResolvedValue(expectedResult);

      const result = await controller.removeFriend(req, "friend-1");

      expect(result).toEqual(expectedResult);
      expect(mockSocialService.removeFriend).toHaveBeenCalledWith("user-1", "friend-1");
    });
  });

  describe("getActivityFeed", () => {
    it("should return activity feed", async () => {
      const req = { user: { id: "user-1" } };
      const query = { page: 1, limit: 20 };
      const activities = [mockActivity];

      mockSocialService.getActivityFeed.mockResolvedValue(activities);

      const result = await controller.getActivityFeed(req, query);

      expect(result).toEqual(activities);
      expect(mockSocialService.getActivityFeed).toHaveBeenCalledWith("user-1", query);
    });
  });

  describe("postActivity", () => {
    it("should post an activity", async () => {
      const req = { user: { id: "user-1" } };
      const dto = {
        type: "glucose",
        message: "Recorded a glucose reading",
        data: { value: 120, unit: "mg/dL" },
      };
      const expectedResult = { ...mockActivity, id: "activity-2" };

      mockSocialService.postActivity.mockResolvedValue(expectedResult);

      const result = await controller.postActivity(req, dto);

      expect(result).toEqual(expectedResult);
      expect(mockSocialService.postActivity).toHaveBeenCalledWith(
        "user-1",
        null,
        dto.type,
        { message: dto.message, ...dto.data }
      );
    });
  });
});

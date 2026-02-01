import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  SendFriendRequestDto,
  RespondToFriendRequestDto,
  PostActivityDto,
  ActivityFeedQueryDto,
} from "./dto/social.dto";
import { AchievementsService } from "../achievements/achievements.service";

@Injectable()
export class SocialService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AchievementsService))
    private achievementsService: AchievementsService,
  ) {}

  async sendFriendRequest(requesterId: string, dto: SendFriendRequestDto) {
    if (requesterId === dto.receiverId) {
      throw new BadRequestException("Cannot send friend request to yourself");
    }

    const receiver = await this.prisma.user.findUnique({
      where: { id: dto.receiverId },
    });

    if (!receiver) {
      throw new NotFoundException("User not found");
    }

    // Check if friendship already exists
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, receiverId: dto.receiverId },
          { requesterId: dto.receiverId, receiverId: requesterId },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException("Friend request already sent or users are friends");
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        requesterId,
        receiverId: dto.receiverId,
        status: "pending",
      },
      include: {
        requester: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        receiver: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    return friendship;
  }

  async respondToFriendRequest(userId: string, friendshipId: string, dto: RespondToFriendRequestDto) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException("Friend request not found");
    }

    if (friendship.receiverId !== userId) {
      throw new BadRequestException("Not authorized to respond to this request");
    }

    if (friendship.status !== "pending") {
      throw new BadRequestException("Friend request already processed");
    }

    const updated = await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: dto.status },
      include: {
        requester: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        receiver: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    // Check for FIRST_FRIEND achievement if accepted
    if (dto.status === "accepted") {
      await this.achievementsService.checkAndUnlockAchievement(friendship.requesterId, "FIRST_FRIEND");
    }

    return updated;
  }

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
        status: "accepted",
      },
      include: {
        requester: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, xp: true, level: true },
        },
        receiver: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, xp: true, level: true },
        },
      },
    });

    return friendships.map((f) => {
      const friend = f.requesterId === userId ? f.receiver : f.requester;
      return {
        id: friend.id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        avatarUrl: friend.avatarUrl,
        xp: friend.xp,
        level: friend.level,
        friendSince: f.updatedAt,
      };
    });
  }

  async getPendingRequests(userId: string) {
    const requests = await this.prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: "pending",
      },
      include: {
        requester: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    return requests.map((r) => ({
      id: r.id,
      requester: r.requester,
      createdAt: r.createdAt,
    }));
  }

  async getActivityFeed(userId: string, query: ActivityFeedQueryDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Get user's friends
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
        status: "accepted",
      },
      select: { requesterId: true, receiverId: true },
    });

    const friendIds = new Set<string>();
    friendships.forEach((f) => {
      friendIds.add(f.requesterId);
      friendIds.add(f.receiverId);
    });
    friendIds.add(userId); // Include own activities

    const [activities, total] = await Promise.all([
      this.prisma.activityFeed.findMany({
        where: {
          OR: [
            { senderId: { in: Array.from(friendIds) } },
            { receiverId: null }, // Public activities
          ],
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.activityFeed.count({
        where: {
          OR: [
            { senderId: { in: Array.from(friendIds) } },
            { receiverId: null },
          ],
        },
      }),
    ]);

    return {
      data: activities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async postActivity(
    senderId: string,
    receiverId: string | null,
    type: string,
    data: Record<string, any>,
  ) {
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
      select: { firstName: true },
    });

    if (!sender) {
      throw new NotFoundException("User not found");
    }

    const activity = await this.prisma.activityFeed.create({
      data: {
        senderId,
        receiverId,
        type,
        message: data.message || `${sender.firstName} performed ${type}`,
        data,
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    return activity;
  }

  async removeFriend(userId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException("Friendship not found");
    }

    if (friendship.requesterId !== userId && friendship.receiverId !== userId) {
      throw new BadRequestException("Not authorized to remove this friendship");
    }

    await this.prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return { message: "Friend removed successfully" };
  }
}

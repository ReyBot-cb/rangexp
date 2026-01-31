import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { SocialService } from "./social.service";
import {
  SendFriendRequestDto,
  RespondToFriendRequestDto,
  PostActivityDto,
  ActivityFeedQueryDto,
} from "./dto/social.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Social")
@Controller("social")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SocialController {
  constructor(private socialService: SocialService) {}

  @Post("friends/request")
  @ApiOperation({ summary: "Send a friend request" })
  @ApiResponse({ status: 201, description: "Friend request sent" })
  async sendFriendRequest(@Request() req, @Body() dto: SendFriendRequestDto) {
    return this.socialService.sendFriendRequest(req.user.id, dto);
  }

  @Post("friends/request/:id")
  @ApiOperation({ summary: "Respond to a friend request" })
  @ApiResponse({ status: 200, description: "Friend request responded" })
  async respondToFriendRequest(
    @Request() req,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: RespondToFriendRequestDto,
  ) {
    return this.socialService.respondToFriendRequest(req.user.id, id, dto);
  }

  @Get("friends")
  @ApiOperation({ summary: "List all friends" })
  @ApiResponse({ status: 200, description: "List of friends" })
  async getFriends(@Request() req) {
    return this.socialService.getFriends(req.user.id);
  }

  @Get("friends/pending")
  @ApiOperation({ summary: "List pending friend requests" })
  @ApiResponse({ status: 200, description: "Pending requests" })
  async getPendingRequests(@Request() req) {
    return this.socialService.getPendingRequests(req.user.id);
  }

  @Delete("friends/:id")
  @ApiOperation({ summary: "Remove a friend" })
  @ApiResponse({ status: 200, description: "Friend removed" })
  async removeFriend(@Request() req, @Param("id", ParseUUIDPipe) id: string) {
    return this.socialService.removeFriend(req.user.id, id);
  }

  @Get("feed")
  @ApiOperation({ summary: "Get activity feed" })
  @ApiResponse({ status: 200, description: "Activity feed" })
  async getActivityFeed(@Request() req, @Query() query: ActivityFeedQueryDto) {
    return this.socialService.getActivityFeed(req.user.id, query);
  }

  @Post("activity")
  @ApiOperation({ summary: "Post an activity" })
  @ApiResponse({ status: 201, description: "Activity posted" })
  async postActivity(@Request() req, @Body() dto: PostActivityDto) {
    return this.socialService.postActivity(req.user.id, null, dto.type, {
      message: dto.message,
      ...dto.data,
    });
  }
}

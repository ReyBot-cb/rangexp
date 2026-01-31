import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";
import { NotificationQueryDto } from "./dto/notification.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "List user notifications" })
  @ApiResponse({ status: 200, description: "List of notifications" })
  async findAll(@Request() req, @Query() query: NotificationQueryDto) {
    return this.notificationsService.findAll(req.user.id, query);
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notifications count" })
  @ApiResponse({ status: 200, description: "Unread count" })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { unreadCount: count };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific notification" })
  @ApiResponse({ status: 200, description: "Notification details" })
  async findById(@Request() req, @Param("id", ParseUUIDPipe) id: string) {
    return this.notificationsService.findById(req.user.id, id);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark notification as read" })
  @ApiResponse({ status: 200, description: "Notification marked as read" })
  async markAsRead(@Request() req, @Param("id", ParseUUIDPipe) id: string) {
    return this.notificationsService.markAsRead(req.user.id, id);
  }

  @Patch("read-all")
  @ApiOperation({ summary: "Mark all notifications as read" })
  @ApiResponse({ status: 200, description: "All notifications marked as read" })
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a notification" })
  @ApiResponse({ status: 200, description: "Notification deleted" })
  async delete(@Request() req, @Param("id", ParseUUIDPipe) id: string) {
    return this.notificationsService.delete(req.user.id, id);
  }
}

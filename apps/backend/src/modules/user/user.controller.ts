import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { UpdateSettingsDto, UpdateRexDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get("profile")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile data" })
  async getProfile(@Request() req) {
    return this.userService.getProfile(req.user.id);
  }

  @Patch("settings")
  @ApiOperation({ summary: "Update user settings" })
  @ApiResponse({ status: 200, description: "Settings updated" })
  async updateSettings(@Request() req, @Body() dto: UpdateSettingsDto) {
    return this.userService.updateSettings(req.user.id, dto);
  }

  @Patch("rex")
  @ApiOperation({ summary: "Update Rex customization" })
  @ApiResponse({ status: 200, description: "Rex customization updated" })
  async updateRex(@Request() req, @Body() dto: UpdateRexDto) {
    return this.userService.updateRex(req.user.id, dto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get user gamification stats" })
  @ApiResponse({ status: 200, description: "User stats including XP, level, streak" })
  async getStats(@Request() req) {
    return this.userService.getStats(req.user.id);
  }
}

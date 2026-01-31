import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AchievementsService } from "./achievements.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Achievements")
@Controller("achievements")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AchievementsController {
  constructor(private achievementsService: AchievementsService) {}

  @Get()
  @ApiOperation({ summary: "List all achievements" })
  @ApiResponse({ status: 200, description: "List of all achievements" })
  async findAll() {
    return this.achievementsService.findAll();
  }

  @Get("my")
  @ApiOperation({ summary: "Get current user's achievements" })
  @ApiResponse({ status: 200, description: "User achievements with unlock status" })
  async getMyAchievements(@Request() req) {
    return this.achievementsService.getUserAchievements(req.user.id);
  }

  @Post("seed")
  @ApiOperation({ summary: "Seed achievements database (admin)" })
  @ApiResponse({ status: 200, description: "Achievements seeded" })
  async seedAchievements() {
    return this.achievementsService.seedAchievements();
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { GamificationService } from "./gamification.service";
import { AddXpDto } from "./dto/gamification.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Gamification")
@Controller("gamification")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  @Post("xp")
  @ApiOperation({ summary: "Add XP to current user" })
  @ApiResponse({ status: 200, description: "XP added successfully" })
  async addXp(@Request() req, @Body() dto: AddXpDto) {
    return this.gamificationService.addXp(req.user.id, dto);
  }

  @Get("level")
  @ApiOperation({ summary: "Get current level information" })
  @ApiResponse({ status: 200, description: "Level info with progress" })
  async getLevelInfo(@Request() req) {
    return this.gamificationService.getLevelInfo(req.user.id);
  }

  @Post("streak")
  @ApiOperation({ summary: "Update user streak (called when logging activity)" })
  @ApiResponse({ status: 200, description: "Streak updated" })
  async updateStreak(@Request() req) {
    return this.gamificationService.updateStreak(req.user.id);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get gamification stats" })
  @ApiResponse({ status: 200, description: "Gamification statistics" })
  async getStats(@Request() req) {
    const levelInfo = await this.gamificationService.getLevelInfo(req.user.id);
    return {
      ...levelInfo,
      streak: levelInfo.currentLevel, // Placeholder, streak comes from user profile
    };
  }

  @Get("streak/recovery")
  @ApiOperation({ summary: "Check if user can recover their lost streak (Premium)" })
  @ApiResponse({ status: 200, description: "Streak recovery status" })
  async getStreakRecoveryStatus(@Request() req) {
    return this.gamificationService.getStreakRecoveryStatus(req.user.id);
  }

  @Post("streak/recover")
  @ApiOperation({ summary: "Recover a lost streak (Premium only)" })
  @ApiResponse({ status: 200, description: "Streak recovered successfully" })
  @ApiResponse({ status: 400, description: "Cannot recover streak" })
  async recoverStreak(@Request() req) {
    return this.gamificationService.recoverStreak(req.user.id);
  }
}

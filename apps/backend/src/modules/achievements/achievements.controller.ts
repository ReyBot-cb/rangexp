import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { RetroactiveProcessorService } from './retroactive/retroactive-processor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CATEGORY_NAMES, CATEGORY_DESCRIPTIONS, CATEGORY_ORDER } from './constants/categories';

@ApiTags('Achievements')
@Controller('achievements')
export class AchievementsController {
  constructor(
    private achievementsService: AchievementsService,
    private retroactiveProcessor: RetroactiveProcessorService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all achievements' })
  @ApiResponse({ status: 200, description: 'List of all achievements' })
  async findAll() {
    return this.achievementsService.findAll();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get achievement categories with metadata' })
  @ApiResponse({ status: 200, description: 'List of achievement categories' })
  async getCategories() {
    return {
      categories: CATEGORY_ORDER.map((category) => ({
        code: category,
        name: CATEGORY_NAMES[category],
        description: CATEGORY_DESCRIPTIONS[category],
      })),
    };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's achievements" })
  @ApiResponse({ status: 200, description: 'User achievements with unlock status' })
  async getMyAchievements(@Request() req) {
    return this.achievementsService.getUserAchievements(req.user.id);
  }

  @Get('my/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's achievements with progress" })
  @ApiResponse({ status: 200, description: 'User achievements with progress information' })
  async getMyAchievementsWithProgress(@Request() req) {
    return this.achievementsService.getUserAchievementsWithProgress(req.user.id);
  }

  @Get('category/:category')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get achievements by category' })
  @ApiParam({ name: 'category', description: 'Achievement category (REGISTROS, RACHAS, NIVELES, SOCIAL, CONTEXTOS, CONTROL, ESPECIALES)' })
  @ApiResponse({ status: 200, description: 'Achievements in the category' })
  async getByCategory(@Param('category') category: string) {
    const achievements = await this.achievementsService.findByCategory(
      category as any,
    );
    return {
      category,
      name: CATEGORY_NAMES[category] || category,
      description: CATEGORY_DESCRIPTIONS[category] || '',
      achievements,
    };
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed achievements database (admin)' })
  @ApiResponse({ status: 200, description: 'Achievements seeded' })
  async seedAchievements() {
    return this.achievementsService.seedAchievements();
  }

  @Post('admin/retroactive')
  @ApiOperation({ summary: 'Process retroactive achievements for all users (admin)' })
  @ApiResponse({ status: 200, description: 'Retroactive processing results' })
  async processRetroactive() {
    return this.retroactiveProcessor.processAllPending();
  }

  @Post('admin/retroactive/:achievementId')
  @ApiOperation({ summary: 'Process retroactive achievement for a specific achievement (admin)' })
  @ApiParam({ name: 'achievementId', description: 'Achievement ID to process' })
  @ApiResponse({ status: 200, description: 'Processing result' })
  async processRetroactiveById(@Param('achievementId') achievementId: string) {
    return this.retroactiveProcessor.processAchievement(achievementId);
  }

  @Get('admin/retroactive/status')
  @ApiOperation({ summary: 'Get retroactive processing status (admin)' })
  @ApiResponse({ status: 200, description: 'Processing status for all achievements' })
  async getRetroactiveStatus() {
    return this.retroactiveProcessor.getStatus();
  }

  @Get('admin/retroactive/status/:achievementId')
  @ApiOperation({ summary: 'Get retroactive processing status for a specific achievement (admin)' })
  @ApiParam({ name: 'achievementId', description: 'Achievement ID' })
  @ApiResponse({ status: 200, description: 'Processing status' })
  async getRetroactiveStatusById(@Param('achievementId') achievementId: string) {
    return this.retroactiveProcessor.getAchievementStatus(achievementId);
  }
}

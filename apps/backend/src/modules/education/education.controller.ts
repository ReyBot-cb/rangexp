import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { EducationService } from "./education.service";
import {
  SubmitQuizDto,
  ModuleQueryDto,
  MarkCompletedDto,
} from "./dto/education.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Education")
@Controller("education")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EducationController {
  constructor(private educationService: EducationService) {}

  @Get("modules")
  @ApiOperation({ summary: "List all education modules" })
  @ApiResponse({ status: 200, description: "List of modules" })
  async findAll(@Query() query: ModuleQueryDto) {
    return this.educationService.findAll(query);
  }

  @Get("modules/:id")
  @ApiOperation({ summary: "Get a specific module" })
  @ApiResponse({ status: 200, description: "Module details" })
  async findById(@Param("id", ParseUUIDPipe) id: string) {
    return this.educationService.findById(id);
  }

  @Get("progress")
  @ApiOperation({ summary: "Get user's education progress" })
  @ApiResponse({ status: 200, description: "User progress for all modules" })
  async getAllProgress(@Request() req) {
    return this.educationService.getAllUserProgress(req.user.id);
  }

  @Get("modules/:id/progress")
  @ApiOperation({ summary: "Get user's progress for a specific module" })
  @ApiResponse({ status: 200, description: "Module progress" })
  async getModuleProgress(@Request() req, @Param("id", ParseUUIDPipe) id: string) {
    return this.educationService.getUserProgress(req.user.id, id);
  }

  @Post("modules/:id/complete")
  @ApiOperation({ summary: "Mark a module as completed" })
  @ApiResponse({ status: 200, description: "Module marked as completed" })
  async markAsCompleted(
    @Request() req,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: MarkCompletedDto,
  ) {
    return this.educationService.markAsCompleted(req.user.id, id, dto);
  }

  @Post("modules/:id/quiz")
  @ApiOperation({ summary: "Submit quiz answers" })
  @ApiResponse({ status: 200, description: "Quiz result" })
  async submitQuiz(
    @Request() req,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.educationService.submitQuiz(req.user.id, id, dto);
  }

  @Post("seed")
  @ApiOperation({ summary: "Seed education modules (admin)" })
  @ApiResponse({ status: 200, description: "Modules seeded" })
  async seedModules() {
    return this.educationService.seedModules();
  }
}

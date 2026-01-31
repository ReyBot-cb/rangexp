import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { GlucoseService } from "./glucose.service";
import { CreateGlucoseDto, UpdateGlucoseDto, GlucoseQueryDto } from "./dto/glucose.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Glucose")
@Controller("glucose")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GlucoseController {
  constructor(private glucoseService: GlucoseService) {}

  @Post()
  @ApiOperation({ summary: "Create a new glucose reading" })
  @ApiResponse({ status: 201, description: "Reading created successfully" })
  async create(@Request() req, @Body() dto: CreateGlucoseDto) {
    return this.glucoseService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "List glucose readings with pagination" })
  @ApiResponse({ status: 200, description: "List of readings" })
  async findAll(@Request() req, @Query() query: GlucoseQueryDto) {
    return this.glucoseService.findAll(req.user.id, query);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get glucose statistics" })
  @ApiQuery({ name: "days", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Glucose statistics" })
  async getStats(@Request() req, @Query("days") days?: number) {
    return this.glucoseService.getStats(req.user.id, days || 7);
  }

  @Get("latest")
  @ApiOperation({ summary: "Get latest glucose readings" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Latest readings" })
  async getLatest(@Request() req, @Query("limit") limit?: number) {
    return this.glucoseService.getLatestReadings(req.user.id, limit || 5);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific glucose reading" })
  @ApiResponse({ status: 200, description: "Reading details" })
  @ApiResponse({ status: 404, description: "Reading not found" })
  async findById(@Request() req, @Param("id", ParseUUIDPipe) id: string) {
    return this.glucoseService.findById(req.user.id, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a glucose reading" })
  @ApiResponse({ status: 200, description: "Reading updated" })
  async update(
    @Request() req,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateGlucoseDto,
  ) {
    return this.glucoseService.update(req.user.id, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a glucose reading" })
  @ApiResponse({ status: 200, description: "Reading deleted" })
  async delete(@Request() req, @Param("id", ParseUUIDPipe) id: string) {
    return this.glucoseService.delete(req.user.id, id);
  }
}

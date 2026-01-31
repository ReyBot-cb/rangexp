import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { CreateGlucoseDto, UpdateGlucoseDto, GlucoseQueryDto } from "./dto/glucose.dto";

@Injectable()
export class GlucoseService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateGlucoseDto) {
    const reading = await this.prisma.glucoseReading.create({
      data: {
        userId,
        value: dto.value,
        unit: dto.unit || "MG_DL",
        note: dto.note,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date(),
        context: dto.context,
      },
    });

    return reading;
  }

  async findAll(userId: string, query: GlucoseQueryDto) {
    const { page = 1, limit = 20, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (startDate || endDate) {
      where.recordedAt = {};
      if (startDate) where.recordedAt.gte = new Date(startDate);
      if (endDate) where.recordedAt.lte = new Date(endDate);
    }

    const [readings, total] = await Promise.all([
      this.prisma.glucoseReading.findMany({
        where,
        orderBy: { recordedAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.glucoseReading.count({ where }),
    ]);

    return {
      data: readings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(userId: string, id: string) {
    const reading = await this.prisma.glucoseReading.findUnique({
      where: { id },
    });

    if (!reading) {
      throw new NotFoundException("Reading not found");
    }

    if (reading.userId !== userId) {
      throw new ForbiddenException("Not authorized to access this reading");
    }

    return reading;
  }

  async update(userId: string, id: string, dto: UpdateGlucoseDto) {
    await this.findById(userId, id);

    const reading = await this.prisma.glucoseReading.update({
      where: { id },
      data: {
        value: dto.value,
        unit: dto.unit,
        note: dto.note,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : undefined,
        context: dto.context,
      },
    });

    return reading;
  }

  async delete(userId: string, id: string) {
    await this.findById(userId, id);

    await this.prisma.glucoseReading.delete({
      where: { id },
    });

    return { message: "Reading deleted successfully" };
  }

  async getStats(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const readings = await this.prisma.glucoseReading.findMany({
      where: {
        userId,
        recordedAt: { gte: startDate },
      },
      orderBy: { recordedAt: "asc" },
    });

    if (readings.length === 0) {
      return {
        period: `${days} days`,
        average: null,
        min: null,
        max: null,
        readingsCount: 0,
        readings: [],
      };
    }

    const values = readings.map((r) => r.value);
    const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      period: `${days} days`,
      average,
      min,
      max,
      readingsCount: readings.length,
      readings: readings.map((r) => ({
        id: r.id,
        value: r.value,
        unit: r.unit,
        recordedAt: r.recordedAt,
      })),
    };
  }

  async getLatestReadings(userId: string, limit: number = 5) {
    return this.prisma.glucoseReading.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: limit,
    });
  }

  async getRecentCount(userId: string, hours: number = 24): Promise<number> {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    return this.prisma.glucoseReading.count({
      where: {
        userId,
        recordedAt: { gte: startDate },
      },
    });
  }
}

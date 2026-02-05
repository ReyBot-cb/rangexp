import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GlucoseContext, TimeWindow } from '../types/condition.types';

// Glucose range thresholds (mg/dL)
const GLUCOSE_RANGE = {
  LOW: 70,
  HIGH: 180,
};

interface ReadingsFilter {
  context?: GlucoseContext;
  inRange?: boolean;
  startDate?: Date;
  endDate?: Date;
}

interface TimeInRangeResult {
  totalReadings: number;
  inRangeReadings: number;
  percentage: number;
}

interface ConsecutiveResult {
  current: number;
  max: number;
}

@Injectable()
export class GlucoseQueryService {
  constructor(private prisma: PrismaService) {}

  // Get total readings count with optional filters
  async getReadingsCount(userId: string, filters?: ReadingsFilter): Promise<number> {
    const where: Record<string, unknown> = { userId };

    if (filters?.context) {
      where.context = filters.context;
    }

    if (filters?.startDate || filters?.endDate) {
      where.recordedAt = {};
      if (filters.startDate) {
        (where.recordedAt as Record<string, Date>).gte = filters.startDate;
      }
      if (filters.endDate) {
        (where.recordedAt as Record<string, Date>).lte = filters.endDate;
      }
    }

    if (filters?.inRange) {
      where.value = {
        gte: GLUCOSE_RANGE.LOW,
        lte: GLUCOSE_RANGE.HIGH,
      };
    }

    return this.prisma.glucoseReading.count({ where });
  }

  // Get readings for today
  async getTodayReadingsCount(userId: string, context?: GlucoseContext): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.getReadingsCount(userId, {
      context,
      startDate: today,
    });
  }

  // Get unique contexts in a day
  async getUniqueContextsToday(userId: string): Promise<string[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const readings = await this.prisma.glucoseReading.findMany({
      where: {
        userId,
        recordedAt: { gte: today },
        context: { not: null },
      },
      select: { context: true },
      distinct: ['context'],
    });

    return readings.map((r) => r.context).filter((c): c is string => c !== null);
  }

  // Calculate time in range for a window
  async getTimeInRange(userId: string, window: TimeWindow, minSamples = 1): Promise<TimeInRangeResult> {
    const startDate = this.getWindowStartDate(window);

    const totalReadings = await this.prisma.glucoseReading.count({
      where: {
        userId,
        recordedAt: { gte: startDate },
      },
    });

    if (totalReadings < minSamples) {
      return {
        totalReadings,
        inRangeReadings: 0,
        percentage: 0,
      };
    }

    const inRangeReadings = await this.prisma.glucoseReading.count({
      where: {
        userId,
        recordedAt: { gte: startDate },
        value: {
          gte: GLUCOSE_RANGE.LOW,
          lte: GLUCOSE_RANGE.HIGH,
        },
      },
    });

    return {
      totalReadings,
      inRangeReadings,
      percentage: Math.round((inRangeReadings / totalReadings) * 100),
    };
  }

  // Get consecutive in-range readings
  async getConsecutiveInRangeReadings(userId: string): Promise<ConsecutiveResult> {
    const readings = await this.prisma.glucoseReading.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      select: { value: true },
      take: 1000,
    });

    let current = 0;
    let max = 0;
    let counting = true;

    for (const reading of readings) {
      const isInRange = reading.value >= GLUCOSE_RANGE.LOW && reading.value <= GLUCOSE_RANGE.HIGH;

      if (isInRange) {
        if (counting) {
          current++;
        }
        max = Math.max(max, current);
      } else {
        if (counting) {
          counting = false;
        }
        current = 0;
      }
    }

    return { current, max };
  }

  // Check if all readings today are in range
  async areAllTodayReadingsInRange(userId: string, minReadings = 1): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalToday = await this.prisma.glucoseReading.count({
      where: {
        userId,
        recordedAt: { gte: today },
      },
    });

    if (totalToday < minReadings) {
      return false;
    }

    const outOfRangeToday = await this.prisma.glucoseReading.count({
      where: {
        userId,
        recordedAt: { gte: today },
        OR: [
          { value: { lt: GLUCOSE_RANGE.LOW } },
          { value: { gt: GLUCOSE_RANGE.HIGH } },
        ],
      },
    });

    return outOfRangeToday === 0;
  }

  // Count perfect days (all readings in range) in a window
  async getPerfectDaysCount(userId: string, window: TimeWindow, minReadingsPerDay = 1): Promise<number> {
    const startDate = this.getWindowStartDate(window);

    const readings = await this.prisma.glucoseReading.findMany({
      where: {
        userId,
        recordedAt: { gte: startDate },
      },
      orderBy: { recordedAt: 'asc' },
      select: { value: true, recordedAt: true },
    });

    // Group readings by day
    const dayReadings = new Map<string, number[]>();
    for (const reading of readings) {
      const dayKey = reading.recordedAt.toISOString().split('T')[0];
      if (!dayReadings.has(dayKey)) {
        dayReadings.set(dayKey, []);
      }
      dayReadings.get(dayKey)!.push(reading.value);
    }

    // Count perfect days
    let perfectDays = 0;
    for (const values of dayReadings.values()) {
      if (values.length >= minReadingsPerDay) {
        const allInRange = values.every(
          (v) => v >= GLUCOSE_RANGE.LOW && v <= GLUCOSE_RANGE.HIGH
        );
        if (allInRange) {
          perfectDays++;
        }
      }
    }

    return perfectDays;
  }

  // Get consecutive days with readings in a specific context
  async getConsecutiveDaysWithContext(userId: string, context: GlucoseContext): Promise<number> {
    const readings = await this.prisma.glucoseReading.findMany({
      where: {
        userId,
        context,
      },
      orderBy: { recordedAt: 'desc' },
      select: { recordedAt: true },
    });

    if (readings.length === 0) {
      return 0;
    }

    // Get unique days with this context
    const daysWithContext = new Set<string>();
    for (const reading of readings) {
      daysWithContext.add(reading.recordedAt.toISOString().split('T')[0]);
    }

    // Count consecutive days from today
    let consecutiveDays = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dayKey = checkDate.toISOString().split('T')[0];

      if (daysWithContext.has(dayKey)) {
        consecutiveDays++;
      } else if (consecutiveDays > 0) {
        break;
      }
    }

    return consecutiveDays;
  }

  // Helper to get start date for a time window
  private getWindowStartDate(window: TimeWindow): Date {
    const now = new Date();

    switch (window) {
      case 'day':
        now.setHours(0, 0, 0, 0);
        return now;
      case 'week':
        now.setDate(now.getDate() - 7);
        return now;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        return now;
      case 'year':
        now.setFullYear(now.getFullYear() - 1);
        return now;
      case 'all':
        return new Date(0);
      default:
        return now;
    }
  }
}

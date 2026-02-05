import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GlucoseQueryService } from './glucose-query.service';
import {
  AchievementCondition,
  ConditionEvaluationResult,
  CountCondition,
  UserAttributeCondition,
  TimeWindowCondition,
  InRangeCondition,
  PercentageCondition,
  DateCondition,
  EventCondition,
  ConsecutiveCondition,
  ComparisonOperator,
} from '../types/condition.types';

@Injectable()
export class ConditionEvaluatorService {
  constructor(
    private prisma: PrismaService,
    private glucoseQuery: GlucoseQueryService,
  ) {}

  async evaluate(
    userId: string,
    condition: AchievementCondition,
    eventData?: Record<string, unknown>,
  ): Promise<ConditionEvaluationResult> {
    switch (condition.type) {
      case 'count':
        return this.evaluateCount(userId, condition);
      case 'user_attribute':
        return this.evaluateUserAttribute(userId, condition);
      case 'time_window':
        return this.evaluateTimeWindow(userId, condition);
      case 'in_range':
        return this.evaluateInRange(userId, condition);
      case 'percentage':
        return this.evaluatePercentage(userId, condition);
      case 'date':
        return this.evaluateDate(userId, condition);
      case 'event':
        return this.evaluateEvent(userId, condition, eventData);
      case 'consecutive':
        return this.evaluateConsecutive(userId, condition);
      default:
        return { met: false };
    }
  }

  private async evaluateCount(
    userId: string,
    condition: CountCondition,
  ): Promise<ConditionEvaluationResult> {
    let count = 0;

    switch (condition.entity) {
      case 'glucose_readings':
        count = await this.glucoseQuery.getReadingsCount(userId, {
          context: condition.context,
          inRange: condition.inRange,
        });
        break;

      case 'friends':
        count = await this.prisma.friendship.count({
          where: {
            OR: [{ requesterId: userId }, { receiverId: userId }],
            status: 'accepted',
          },
        });
        break;

      case 'shares':
        // Count share activities
        count = await this.prisma.activityFeed.count({
          where: {
            senderId: userId,
            type: 'SHARE',
          },
        });
        break;

      case 'encouragements':
        // Count encouragement activities sent
        count = await this.prisma.activityFeed.count({
          where: {
            senderId: userId,
            type: 'ENCOURAGEMENT',
          },
        });
        break;
    }

    const met = this.compare(count, condition.operator, condition.value);

    return {
      met,
      progress: count,
      target: condition.value,
      progressPercentage: Math.min(Math.round((count / condition.value) * 100), 100),
    };
  }

  private async evaluateUserAttribute(
    userId: string,
    condition: UserAttributeCondition,
  ): Promise<ConditionEvaluationResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        level: true,
        xp: true,
        isPremium: true,
      },
    });

    if (!user) {
      return { met: false };
    }

    let value: number | boolean;
    switch (condition.attribute) {
      case 'streak':
        value = user.streak;
        break;
      case 'level':
        value = user.level;
        break;
      case 'xp':
        value = user.xp;
        break;
      case 'isPremium':
        value = user.isPremium;
        break;
      default:
        return { met: false };
    }

    if (typeof value === 'boolean') {
      return {
        met: value === condition.value,
        progress: value ? 1 : 0,
        target: 1,
        progressPercentage: value ? 100 : 0,
      };
    }

    const met = this.compare(value, condition.operator, condition.value as number);

    return {
      met,
      progress: value,
      target: condition.value as number,
      progressPercentage: Math.min(
        Math.round((value / (condition.value as number)) * 100),
        100,
      ),
    };
  }

  private async evaluateTimeWindow(
    userId: string,
    condition: TimeWindowCondition,
  ): Promise<ConditionEvaluationResult> {
    if (condition.uniqueContexts && condition.entity === 'glucose_readings') {
      const contexts = await this.glucoseQuery.getUniqueContextsToday(userId);
      const count = contexts.length;
      const met = this.compare(count, condition.operator, condition.value);

      return {
        met,
        progress: count,
        target: condition.value,
        progressPercentage: Math.min(Math.round((count / condition.value) * 100), 100),
      };
    }

    // Count in time window
    const startDate = this.getWindowStartDate(condition.window);
    let count = 0;

    if (condition.entity === 'glucose_readings') {
      count = await this.glucoseQuery.getReadingsCount(userId, {
        context: condition.context,
        startDate,
      });
    }

    const met = this.compare(count, condition.operator, condition.value);

    return {
      met,
      progress: count,
      target: condition.value,
      progressPercentage: Math.min(Math.round((count / condition.value) * 100), 100),
    };
  }

  private async evaluateInRange(
    userId: string,
    condition: InRangeCondition,
  ): Promise<ConditionEvaluationResult> {
    if (condition.consecutive) {
      const { current } = await this.glucoseQuery.getConsecutiveInRangeReadings(userId);
      const met = current >= condition.consecutive;

      return {
        met,
        progress: current,
        target: condition.consecutive,
        progressPercentage: Math.min(
          Math.round((current / condition.consecutive) * 100),
          100,
        ),
      };
    }

    if (condition.allInDay) {
      const met = await this.glucoseQuery.areAllTodayReadingsInRange(
        userId,
        condition.minReadingsPerDay || 1,
      );

      return {
        met,
        progress: met ? 1 : 0,
        target: 1,
        progressPercentage: met ? 100 : 0,
      };
    }

    if (condition.perfectDays) {
      const perfectDays = await this.glucoseQuery.getPerfectDaysCount(
        userId,
        'all',
        condition.minReadingsPerDay || 1,
      );
      const met = perfectDays >= condition.perfectDays;

      return {
        met,
        progress: perfectDays,
        target: condition.perfectDays,
        progressPercentage: Math.min(
          Math.round((perfectDays / condition.perfectDays) * 100),
          100,
        ),
      };
    }

    return { met: false };
  }

  private async evaluatePercentage(
    userId: string,
    condition: PercentageCondition,
  ): Promise<ConditionEvaluationResult> {
    if (condition.metric === 'time_in_range') {
      const result = await this.glucoseQuery.getTimeInRange(
        userId,
        condition.window,
        condition.minSamples,
      );

      if (result.totalReadings < (condition.minSamples || 1)) {
        return {
          met: false,
          progress: 0,
          target: condition.value,
          progressPercentage: 0,
        };
      }

      const met = this.compare(result.percentage, condition.operator, condition.value);

      return {
        met,
        progress: result.percentage,
        target: condition.value,
        progressPercentage: Math.min(
          Math.round((result.percentage / condition.value) * 100),
          100,
        ),
      };
    }

    return { met: false };
  }

  private async evaluateDate(
    userId: string,
    condition: DateCondition,
  ): Promise<ConditionEvaluationResult> {
    const now = new Date();

    switch (condition.check) {
      case 'month_day': {
        // Check if today matches month-day format "MM-DD"
        const [month, day] = (condition.value as string).split('-').map(Number);
        const met = now.getMonth() + 1 === month && now.getDate() === day;

        // Also check if they logged today
        if (met) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const hasLoggedToday = await this.prisma.glucoseReading.count({
            where: {
              userId,
              recordedAt: { gte: today },
            },
          });
          return {
            met: hasLoggedToday > 0,
            progress: hasLoggedToday > 0 ? 1 : 0,
            target: 1,
            progressPercentage: hasLoggedToday > 0 ? 100 : 0,
          };
        }

        return { met: false, progress: 0, target: 1, progressPercentage: 0 };
      }

      case 'before': {
        // Check if user registered before a specific date
        const targetDate = new Date(condition.value as string);
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { createdAt: true },
        });

        const met = user ? user.createdAt < targetDate : false;
        return {
          met,
          progress: met ? 1 : 0,
          target: 1,
          progressPercentage: met ? 100 : 0,
        };
      }

      case 'user_number': {
        // Check if user is among the first N users
        const maxUserNumber = condition.value as number;
        const userCount = await this.prisma.user.count({
          where: {
            id: userId,
          },
        });

        // Get user's position
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { createdAt: true },
        });

        if (!user) {
          return { met: false };
        }

        const usersBeforeCount = await this.prisma.user.count({
          where: {
            createdAt: { lt: user.createdAt },
          },
        });

        const userPosition = usersBeforeCount + 1;
        const met = userPosition <= maxUserNumber;

        return {
          met,
          progress: met ? 1 : 0,
          target: 1,
          progressPercentage: met ? 100 : 0,
        };
      }

      default:
        return { met: false };
    }
  }

  private async evaluateEvent(
    userId: string,
    condition: EventCondition,
    eventData?: Record<string, unknown>,
  ): Promise<ConditionEvaluationResult> {
    // Event conditions are met when the event occurs
    // The eventData should contain the required data
    if (!eventData) {
      return { met: false };
    }

    // Check if event name matches
    if (eventData.eventName !== condition.eventName) {
      return { met: false };
    }

    // Check required data if specified
    if (condition.requiresData) {
      for (const [key, value] of Object.entries(condition.requiresData)) {
        if (eventData[key] !== value) {
          return { met: false };
        }
      }
    }

    return {
      met: true,
      progress: 1,
      target: 1,
      progressPercentage: 100,
    };
  }

  private async evaluateConsecutive(
    userId: string,
    condition: ConsecutiveCondition,
  ): Promise<ConditionEvaluationResult> {
    if (condition.requireContext) {
      const consecutiveDays = await this.glucoseQuery.getConsecutiveDaysWithContext(
        userId,
        condition.requireContext,
      );
      const met = consecutiveDays >= condition.days;

      return {
        met,
        progress: consecutiveDays,
        target: condition.days,
        progressPercentage: Math.min(
          Math.round((consecutiveDays / condition.days) * 100),
          100,
        ),
      };
    }

    // Generic consecutive days with readings
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true },
    });

    const streak = user?.streak || 0;
    const met = streak >= condition.days;

    return {
      met,
      progress: streak,
      target: condition.days,
      progressPercentage: Math.min(
        Math.round((streak / condition.days) * 100),
        100,
      ),
    };
  }

  private compare(value: number, operator: ComparisonOperator, target: number): boolean {
    switch (operator) {
      case 'eq':
        return value === target;
      case 'gte':
        return value >= target;
      case 'gt':
        return value > target;
      case 'lte':
        return value <= target;
      case 'lt':
        return value < target;
      default:
        return false;
    }
  }

  private getWindowStartDate(window: string): Date {
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

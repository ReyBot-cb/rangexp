import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConditionEvaluatorService } from '../evaluators/condition-evaluator.service';
import { AchievementCondition } from '../types/condition.types';

export interface ProcessingResult {
  achievementId: string;
  achievementCode: string;
  totalUsers: number;
  processedUsers: number;
  awardedCount: number;
  status: 'completed' | 'failed';
  errorMessage?: string;
}

export interface ProcessingStatus {
  achievementId: string;
  achievementCode: string;
  status: string;
  totalUsers: number;
  processedUsers: number;
  awardedCount: number;
  startedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
}

const BATCH_SIZE = 100;

@Injectable()
export class RetroactiveProcessorService {
  private readonly logger = new Logger(RetroactiveProcessorService.name);

  constructor(
    private prisma: PrismaService,
    private conditionEvaluator: ConditionEvaluatorService,
  ) {}

  // Process a single achievement for all users
  async processAchievement(achievementId: string): Promise<ProcessingResult> {
    const achievement = await this.prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      return {
        achievementId,
        achievementCode: 'UNKNOWN',
        totalUsers: 0,
        processedUsers: 0,
        awardedCount: 0,
        status: 'failed',
        errorMessage: 'Achievement not found',
      };
    }

    this.logger.log(`Starting retroactive processing for achievement: ${achievement.code}`);

    // Create or update processing log
    let processingLog = await this.prisma.achievementProcessingLog.findFirst({
      where: {
        achievementId,
        status: { in: ['pending', 'processing'] },
      },
    });

    const totalUsers = await this.prisma.user.count();

    if (!processingLog) {
      processingLog = await this.prisma.achievementProcessingLog.create({
        data: {
          achievementId,
          status: 'processing',
          totalUsers,
          processedUsers: 0,
          awardedCount: 0,
          startedAt: new Date(),
        },
      });
    } else {
      await this.prisma.achievementProcessingLog.update({
        where: { id: processingLog.id },
        data: {
          status: 'processing',
          totalUsers,
          startedAt: new Date(),
        },
      });
    }

    let processedUsers = 0;
    let awardedCount = 0;
    let cursor: string | undefined;

    try {
      while (true) {
        // Fetch users in batches using cursor pagination
        const users = await this.prisma.user.findMany({
          take: BATCH_SIZE,
          ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
          orderBy: { id: 'asc' },
          select: { id: true },
        });

        if (users.length === 0) {
          break;
        }

        for (const user of users) {
          // Check if user already has this achievement
          const existing = await this.prisma.userAchievement.findUnique({
            where: {
              userId_achievementId: {
                userId: user.id,
                achievementId,
              },
            },
          });

          if (existing) {
            processedUsers++;
            continue;
          }

          // Evaluate condition
          const result = await this.conditionEvaluator.evaluate(
            user.id,
            achievement.condition as unknown as AchievementCondition,
          );

          if (result.met) {
            // Award achievement
            await this.prisma.userAchievement.create({
              data: {
                userId: user.id,
                achievementId,
              },
            });

            // Award XP if specified
            if (achievement.xpReward > 0) {
              await this.prisma.user.update({
                where: { id: user.id },
                data: {
                  xp: { increment: achievement.xpReward },
                },
              });
            }

            // Create notification
            await this.prisma.notification.create({
              data: {
                userId: user.id,
                type: 'ACHIEVEMENT',
                title: 'Logro desbloqueado',
                message: `Has desbloqueado: ${achievement.name}`,
                data: {
                  achievementCode: achievement.code,
                  achievementName: achievement.name,
                  xpReward: achievement.xpReward,
                },
              },
            });

            awardedCount++;
          }

          processedUsers++;
        }

        // Update progress
        await this.prisma.achievementProcessingLog.update({
          where: { id: processingLog.id },
          data: {
            processedUsers,
            awardedCount,
          },
        });

        cursor = users[users.length - 1].id;
        this.logger.debug(
          `Processed ${processedUsers}/${totalUsers} users for ${achievement.code}, awarded: ${awardedCount}`,
        );
      }

      // Mark as completed
      await this.prisma.achievementProcessingLog.update({
        where: { id: processingLog.id },
        data: {
          status: 'completed',
          processedUsers,
          awardedCount,
          completedAt: new Date(),
        },
      });

      this.logger.log(
        `Completed retroactive processing for ${achievement.code}: ${awardedCount} awarded`,
      );

      return {
        achievementId,
        achievementCode: achievement.code,
        totalUsers,
        processedUsers,
        awardedCount,
        status: 'completed',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.prisma.achievementProcessingLog.update({
        where: { id: processingLog.id },
        data: {
          status: 'failed',
          errorMessage,
          completedAt: new Date(),
        },
      });

      this.logger.error(
        `Failed retroactive processing for ${achievement.code}: ${errorMessage}`,
      );

      return {
        achievementId,
        achievementCode: achievement.code,
        totalUsers,
        processedUsers,
        awardedCount,
        status: 'failed',
        errorMessage,
      };
    }
  }

  // Process all achievements that need retroactive processing
  async processAllPending(): Promise<ProcessingResult[]> {
    // Find achievements without any completed processing log
    const achievements = await this.prisma.achievement.findMany({
      where: {
        processingLogs: {
          none: {
            status: 'completed',
          },
        },
      },
    });

    this.logger.log(`Found ${achievements.length} achievements needing retroactive processing`);

    const results: ProcessingResult[] = [];

    for (const achievement of achievements) {
      const result = await this.processAchievement(achievement.id);
      results.push(result);
    }

    return results;
  }

  // Get processing status for all achievements
  async getStatus(): Promise<ProcessingStatus[]> {
    const achievements = await this.prisma.achievement.findMany({
      include: {
        processingLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return achievements.map((achievement) => {
      const log = achievement.processingLogs[0];

      return {
        achievementId: achievement.id,
        achievementCode: achievement.code,
        status: log?.status || 'pending',
        totalUsers: log?.totalUsers || 0,
        processedUsers: log?.processedUsers || 0,
        awardedCount: log?.awardedCount || 0,
        startedAt: log?.startedAt || null,
        completedAt: log?.completedAt || null,
        errorMessage: log?.errorMessage || null,
      };
    });
  }

  // Get detailed status for a single achievement
  async getAchievementStatus(achievementId: string): Promise<ProcessingStatus | null> {
    const achievement = await this.prisma.achievement.findUnique({
      where: { id: achievementId },
      include: {
        processingLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!achievement) {
      return null;
    }

    const log = achievement.processingLogs[0];

    return {
      achievementId: achievement.id,
      achievementCode: achievement.code,
      status: log?.status || 'pending',
      totalUsers: log?.totalUsers || 0,
      processedUsers: log?.processedUsers || 0,
      awardedCount: log?.awardedCount || 0,
      startedAt: log?.startedAt || null,
      completedAt: log?.completedAt || null,
      errorMessage: log?.errorMessage || null,
    };
  }
}

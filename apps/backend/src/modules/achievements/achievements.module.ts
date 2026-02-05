import { Module, forwardRef } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { GamificationModule } from '../gamification/gamification.module';
import { SocialModule } from '../social/social.module';
import { ConditionEvaluatorService } from './evaluators/condition-evaluator.service';
import { GlucoseQueryService } from './evaluators/glucose-query.service';
import { RetroactiveProcessorService } from './retroactive/retroactive-processor.service';

@Module({
  imports: [
    forwardRef(() => GamificationModule),
    forwardRef(() => SocialModule),
  ],
  controllers: [AchievementsController],
  providers: [
    AchievementsService,
    ConditionEvaluatorService,
    GlucoseQueryService,
    RetroactiveProcessorService,
  ],
  exports: [AchievementsService],
})
export class AchievementsModule {}

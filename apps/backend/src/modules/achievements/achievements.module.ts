import { Module, forwardRef } from "@nestjs/common";
import { AchievementsService } from "./achievements.service";
import { AchievementsController } from "./achievements.controller";
import { GamificationModule } from "../gamification/gamification.module";
import { SocialModule } from "../social/social.module";

@Module({
  imports: [
    forwardRef(() => GamificationModule),
    forwardRef(() => SocialModule),
  ],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}

import { Module, forwardRef } from "@nestjs/common";
import { GamificationService } from "./gamification.service";
import { GamificationController } from "./gamification.controller";
import { AchievementsModule } from "../achievements/achievements.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [forwardRef(() => AchievementsModule), UserModule],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}

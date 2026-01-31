import { Module, forwardRef } from "@nestjs/common";
import { SocialService } from "./social.service";
import { SocialController } from "./social.controller";
import { AchievementsModule } from "../achievements/achievements.module";

@Module({
  imports: [forwardRef(() => AchievementsModule)],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}

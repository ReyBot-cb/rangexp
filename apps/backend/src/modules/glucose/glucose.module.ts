import { Module } from "@nestjs/common";
import { GlucoseService } from "./glucose.service";
import { GlucoseController } from "./glucose.controller";
import { GamificationModule } from "../gamification/gamification.module";

@Module({
  imports: [GamificationModule],
  controllers: [GlucoseController],
  providers: [GlucoseService],
  exports: [GlucoseService],
})
export class GlucoseModule {}

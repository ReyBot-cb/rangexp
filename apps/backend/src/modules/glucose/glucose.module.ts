import { Module } from "@nestjs/common";
import { GlucoseService } from "./glucose.service";
import { GlucoseController } from "./glucose.controller";

@Module({
  controllers: [GlucoseController],
  providers: [GlucoseService],
  exports: [GlucoseService],
})
export class GlucoseModule {}

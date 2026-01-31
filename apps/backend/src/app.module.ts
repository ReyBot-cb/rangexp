import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "./prisma/prisma.service";
import { CommonModule } from "./common/common.module";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { GlucoseModule } from "./modules/glucose/glucose.module";
import { GamificationModule } from "./modules/gamification/gamification.module";
import { SocialModule } from "./modules/social/social.module";
import { AchievementsModule } from "./modules/achievements/achievements.module";
import { EducationModule } from "./modules/education/education.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    HealthModule,
    AuthModule,
    UserModule,
    GlucoseModule,
    GamificationModule,
    SocialModule,
    AchievementsModule,
    EducationModule,
    NotificationsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

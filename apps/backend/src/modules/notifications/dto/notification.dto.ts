import { IsString, IsOptional, IsEnum, IsBoolean } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum NotificationType {
  ACHIEVEMENT = "ACHIEVEMENT",
  FRIEND_REQUEST = "FRIEND_REQUEST",
  STREAK_REMINDER = "STREAK_REMINDER",
  LEVEL_UP = "LEVEL_UP",
  SYSTEM = "SYSTEM",
}

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType })
  @IsString()
  type: string;

  @ApiProperty({ example: "Logro desbloqueado" })
  @IsString()
  title: string;

  @ApiProperty({ example: "¡Felicidades! Has desbloqueado..." })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: "Additional data" })
  @IsOptional()
  data?: Record<string, any>;
}

export class NotificationQueryDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean = false;
}

import { IsString, IsOptional, IsEnum, IsUUID } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum FriendshipStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export class SendFriendRequestDto {
  @ApiProperty({ description: "User ID to send friend request to" })
  @IsUUID()
  receiverId: string;
}

export class RespondToFriendRequestDto {
  @ApiProperty({ enum: FriendshipStatus, example: "accepted" })
  @IsEnum(FriendshipStatus)
  status: FriendshipStatus;
}

export class PostActivityDto {
  @ApiProperty({ example: "LOG_READING" })
  @IsString()
  type: string;

  @ApiProperty({ example: "Registré 120 mg/dL" })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: "Additional data for the activity" })
  @IsOptional()
  data?: Record<string, any>;
}

export class ActivityFeedQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number = 20;
}

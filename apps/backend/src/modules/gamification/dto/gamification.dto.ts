import { IsInt, IsOptional, IsString, Min, Max } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AddXpDto {
  @ApiProperty({ example: 10, description: "XP amount to add" })
  @IsInt()
  @Min(1)
  @Max(1000)
  amount: number;

  @ApiPropertyOptional({ example: "LOG_READING" })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateStreakDto {
  @ApiPropertyOptional({ description: "Force streak value (admin use)" })
  @IsOptional()
  @IsInt()
  @Min(0)
  streak?: number;
}

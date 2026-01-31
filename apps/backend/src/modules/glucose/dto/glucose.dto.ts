import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  Min,
  Max,
  IsDateString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum GlucoseUnit {
  MG_DL = "MG_DL",
  MMOL_L = "MMOL_L",
}

export enum GlucoseContext {
  FASTING = "FASTING",
  BEFORE_MEAL = "BEFORE_MEAL",
  AFTER_MEAL = "AFTER_MEAL",
  BEDTIME = "BEDTIME",
  OTHER = "OTHER",
}

export class CreateGlucoseDto {
  @ApiProperty({ example: 120, description: "Glucose value" })
  @IsInt()
  @Min(20)
  @Max(600)
  value: number;

  @ApiPropertyOptional({ enum: GlucoseUnit, example: "MG_DL" })
  @IsOptional()
  @IsEnum(GlucoseUnit)
  unit?: GlucoseUnit;

  @ApiPropertyOptional({ example: "After lunch" })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: "2024-01-15T12:00:00Z" })
  @IsOptional()
  @IsDateString()
  recordedAt?: string;

  @ApiPropertyOptional({ enum: GlucoseContext, example: "AFTER_MEAL" })
  @IsOptional()
  @IsEnum(GlucoseContext)
  context?: GlucoseContext;
}

export class UpdateGlucoseDto {
  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt()
  @Min(20)
  @Max(600)
  value?: number;

  @ApiPropertyOptional({ enum: GlucoseUnit })
  @IsOptional()
  @IsEnum(GlucoseUnit)
  unit?: GlucoseUnit;

  @ApiPropertyOptional({ example: "Updated note" })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: "2024-01-15T12:00:00Z" })
  @IsOptional()
  @IsDateString()
  recordedAt?: string;

  @ApiPropertyOptional({ enum: GlucoseContext })
  @IsOptional()
  @IsEnum(GlucoseContext)
  context?: GlucoseContext;
}

export class GlucoseQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: "Start date filter" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: "End date filter" })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

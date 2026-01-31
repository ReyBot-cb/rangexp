import { IsInt, IsOptional, IsString, IsBoolean, Min, Max } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateEducationModuleDto {
  @ApiProperty({ example: "BASIC_01" })
  @IsString()
  code: string;

  @ApiProperty({ example: "Introducción a la Glucemia" })
  @IsString()
  title: string;

  @ApiProperty({ example: "Aprende los conceptos básicos" })
  @IsString()
  description: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(3)
  level: number;

  @ApiProperty({ example: "content" })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: "Rich content as JSON" })
  @IsOptional()
  content?: Record<string, any>;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  xpReward?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  order?: number;
}

export class SubmitQuizDto {
  @ApiProperty({ description: "Answers to quiz questions" })
  answers: Record<string, any>;

  @ApiPropertyOptional({ description: "Score if pre-graded" })
  @IsOptional()
  @IsInt()
  @Min(0)
  score?: number;
}

export class ModuleQueryDto {
  @ApiPropertyOptional({ description: "Filter by level", example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  level?: number;
}

export class MarkCompletedDto {
  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number;
}

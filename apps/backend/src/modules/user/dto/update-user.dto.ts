import { IsEnum, IsOptional, IsString, IsNumber, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { GlucoseUnit, Theme, Language } from "../../auth/dto/auth.dto";

export class UpdateSettingsDto {
  @ApiPropertyOptional({ enum: GlucoseUnit })
  @IsOptional()
  @IsEnum(GlucoseUnit)
  glucoseUnit?: GlucoseUnit;

  @ApiPropertyOptional({ enum: Theme })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @ApiPropertyOptional({ enum: Language })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;
}

export class UpdateRexDto {
  @ApiPropertyOptional({ example: "default" })
  @IsOptional()
  @IsString()
  rexCustomization?: string;
}

export class UpdateStatsDto {
  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  xp?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  streak?: number;
}

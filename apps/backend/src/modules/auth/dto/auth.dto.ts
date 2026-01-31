import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum GlucoseUnit {
  MG_DL = "MG_DL",
  MMOL_L = "MMOL_L",
}

export enum Theme {
  LIGHT = "LIGHT",
  DARK = "DARK",
}

export enum Language {
  ES = "ES",
  EN = "EN",
}

export class RegisterDto {
  @ApiProperty({ example: "john@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "securePassword123", minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: "John" })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: "Doe" })
  @IsOptional()
  @IsString()
  lastName?: string;
}

export class LoginDto {
  @ApiProperty({ example: "john@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "securePassword123" })
  @IsString()
  password: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "John" })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: "Doe" })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: "https://example.com/avatar.jpg" })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ enum: GlucoseUnit, example: "MG_DL" })
  @IsOptional()
  @IsEnum(GlucoseUnit)
  glucoseUnit?: GlucoseUnit;

  @ApiPropertyOptional({ enum: Theme, example: "DARK" })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @ApiPropertyOptional({ enum: Language, example: "ES" })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;
}

export class UpdateRexDto {
  @ApiProperty({ example: "default" })
  @IsString()
  rexCustomization: string;
}

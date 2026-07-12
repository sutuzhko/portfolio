import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

// Все поля опциональны — PATCH обновляет только переданные.
export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  siteTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultTheme?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accentColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultLang?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableLanguages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  consoleGlow?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showHighlights?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showAbout?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showStack?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showActivity?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showNow?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showProjects?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showExperience?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showContact?: boolean;
}

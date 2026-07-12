import { ApiPropertyOptional } from '@nestjs/swagger';
import { AvailabilityStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { LocalizedTextPatch } from '../../../common/i18n/localized.dto';
import { ProfileHighlightInput } from './profile-highlight.dto';

// PATCH профиля — все поля опциональны. Локализованные поля принимают одну или
// обе локали: присланная накладывается на сохранённую (см. mergeText в сервисе).
export class UpdateProfileDto {
  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  name?: LocalizedTextPatch;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  roleTitle?: LocalizedTextPatch;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch, description: 'питч героя' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  headline?: LocalizedTextPatch;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  location?: LocalizedTextPatch;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarPhotoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarColor?: string;

  @ApiPropertyOptional({
    type: () => LocalizedTextPatch,
    description: 'ссылка на PDF-резюме по локали',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  cvUrl?: LocalizedTextPatch;

  @ApiPropertyOptional({ type: [String], description: 'слова печатающей строки героя' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  heroStack?: string[];

  @ApiPropertyOptional({ type: () => ProfileHighlightInput, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfileHighlightInput)
  highlights?: ProfileHighlightInput[];

  @ApiPropertyOptional({ enum: AvailabilityStatus, enumName: 'AvailabilityStatus' })
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  bioMarkdown?: LocalizedTextPatch;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBioHidden?: boolean;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch, description: 'интро экрана проектов' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  projectsIntro?: LocalizedTextPatch;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch, description: 'интро экрана опыта' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  experienceIntro?: LocalizedTextPatch;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch, description: 'интро экрана контактов' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  contactIntro?: LocalizedTextPatch;
}

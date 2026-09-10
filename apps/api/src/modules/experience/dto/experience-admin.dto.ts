import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import {
  LocalizedListDto,
  LocalizedListInput,
  LocalizedListPatch,
  LocalizedTextDto,
  LocalizedTextInput,
  LocalizedTextPatch,
} from '../../../common/i18n/localized.dto';

export class ExperienceAdminDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => LocalizedTextDto })
  role: LocalizedTextDto;

  @ApiProperty()
  company: string;

  @ApiProperty({ type: () => LocalizedTextDto, nullable: true })
  location: LocalizedTextDto | null;

  @ApiProperty({ type: () => LocalizedTextDto, nullable: true })
  sub: LocalizedTextDto | null;

  @ApiProperty({ type: () => LocalizedListDto })
  bullets: LocalizedListDto;

  @ApiProperty({ format: 'date-time' })
  startDate: string;

  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  endDate: string | null;

  @ApiProperty()
  current: boolean;

  @ApiProperty({ type: String, nullable: true })
  dotColor: string | null;

  @ApiProperty({ type: [String] })
  technologyIds: string[];
}

export class CreateExperienceDto {
  @ApiProperty({ type: () => LocalizedTextInput })
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  role: LocalizedTextInput;

  @ApiProperty()
  @IsString()
  company: string;

  @ApiPropertyOptional({ type: () => LocalizedTextInput })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  location?: LocalizedTextInput;

  @ApiPropertyOptional({ type: () => LocalizedTextInput })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  sub?: LocalizedTextInput;

  @ApiProperty({ type: () => LocalizedListInput })
  @ValidateNested()
  @Type(() => LocalizedListInput)
  bullets: LocalizedListInput;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  current?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dotColor?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologyIds?: string[];
}

export class UpdateExperienceDto {
  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  role?: LocalizedTextPatch;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  location?: LocalizedTextPatch;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  sub?: LocalizedTextPatch;

  @ApiPropertyOptional({ type: () => LocalizedListPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedListPatch)
  bullets?: LocalizedListPatch;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  current?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dotColor?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologyIds?: string[];
}

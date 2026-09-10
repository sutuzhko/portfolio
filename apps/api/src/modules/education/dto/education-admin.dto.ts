import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EducationType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, ValidateNested } from 'class-validator';

import {
  LocalizedTextDto,
  LocalizedTextInput,
  LocalizedTextPatch,
} from '../../../common/i18n/localized.dto';

export class EducationAdminDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: EducationType, enumName: 'EducationType' })
  type: EducationType;

  @ApiProperty({ type: () => LocalizedTextDto })
  degree: LocalizedTextDto;

  @ApiProperty({ type: () => LocalizedTextDto, nullable: true })
  place: LocalizedTextDto | null;

  @ApiProperty({ format: 'date-time' })
  startDate: string;

  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  endDate: string | null;
}

export class CreateEducationDto {
  @ApiPropertyOptional({ enum: EducationType, enumName: 'EducationType' })
  @IsOptional()
  @IsEnum(EducationType)
  type?: EducationType;

  @ApiProperty({ type: () => LocalizedTextInput })
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  degree: LocalizedTextInput;

  @ApiPropertyOptional({ type: () => LocalizedTextInput })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  place?: LocalizedTextInput;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateEducationDto {
  @ApiPropertyOptional({ enum: EducationType, enumName: 'EducationType' })
  @IsOptional()
  @IsEnum(EducationType)
  type?: EducationType;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  degree?: LocalizedTextPatch;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  place?: LocalizedTextPatch;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  // null снимает дату окончания (курс одной датой), undefined — оставляет как есть.
  @ApiPropertyOptional({ type: String, nullable: true, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  endDate?: string | null;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EducationType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

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

  @ApiProperty({ type: String, nullable: true })
  period: string | null;

  @ApiProperty()
  order: number;
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

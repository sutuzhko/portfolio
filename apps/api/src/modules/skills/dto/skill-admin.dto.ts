import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, ValidateNested } from 'class-validator';

import {
  LocalizedTextDto,
  LocalizedTextInput,
  LocalizedTextPatch,
} from '../../../common/i18n/localized.dto';

export class SkillAdminDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => LocalizedTextDto })
  name: LocalizedTextDto;

  @ApiProperty()
  order: number;
}

export class CreateSkillDto {
  @ApiProperty({ type: () => LocalizedTextInput })
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  name: LocalizedTextInput;

  // Дробный и отрицательный order — норма: админка ставит запись между соседями
  // (или перед первой), не перенумеровывая остальных (колонка — Float).
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateSkillDto {
  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  name?: LocalizedTextPatch;

  // Дробный и отрицательный order — норма: админка ставит запись между соседями
  // (или перед первой), не перенумеровывая остальных (колонка — Float).
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;
}

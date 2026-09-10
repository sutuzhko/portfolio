import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { LocalizedTextDto, LocalizedTextInput } from '../../../common/i18n/localized.dto';

export class ContributorAdminDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => LocalizedTextDto })
  name: LocalizedTextDto;

  @ApiProperty({ type: String, nullable: true })
  image: string | null;

  @ApiProperty({ type: String, nullable: true })
  color: string | null;

  @ApiProperty({ type: String, nullable: true })
  link: string | null;

  @ApiProperty()
  order: number;
}

export class CreateContributorDto {
  @ApiProperty({ type: () => LocalizedTextInput })
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  name: LocalizedTextInput;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  link?: string;

  // Дробный и отрицательный order — норма: админка ставит участника между соседями
  // (или перед первым), не перенумеровывая остальных (колонка — Float).
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateContributorDto {
  @ApiPropertyOptional({ type: () => LocalizedTextInput })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  name?: LocalizedTextInput;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  link?: string;

  // Дробный и отрицательный order — норма: админка ставит участника между соседями
  // (или перед первым), не перенумеровывая остальных (колонка — Float).
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

// Технология в admin-ответах (name — не локализованное поле).
export class TechnologyAdminDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: String, nullable: true })
  category: string | null;

  @ApiProperty()
  order: number;
}

export class CreateTechnologyDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  // Дробный и отрицательный order — норма: админка ставит запись между соседями
  // (или перед первой), не перенумеровывая остальных (колонка — Float).
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateTechnologyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  // Дробный и отрицательный order — норма: админка ставит запись между соседями
  // (или перед первой), не перенумеровывая остальных (колонка — Float).
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

// Контактная ссылка в admin-ответах (включая скрытые).
export class AdminContactLinkDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'telegram | codewars | linkedin | github | email | ...' })
  icon: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  hidden: boolean;

  @ApiProperty()
  order: number;
}

export class CreateContactLinkDto {
  @ApiProperty()
  @IsString()
  icon: string;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateContactLinkDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

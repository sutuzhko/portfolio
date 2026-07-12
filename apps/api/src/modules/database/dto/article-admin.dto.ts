import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublishStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

import { LocalizedTextDto, LocalizedTextInput } from '../../../common/i18n/localized.dto';

export class ArticleAdminDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ type: () => LocalizedTextDto })
  title: LocalizedTextDto;

  @ApiProperty({ type: () => LocalizedTextDto })
  bodyMarkdown: LocalizedTextDto;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ enum: PublishStatus, enumName: 'PublishStatus' })
  status: PublishStatus;

  @ApiProperty()
  order: number;

  @ApiProperty({ type: String, nullable: true })
  folderId: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

export class CreateArticleDto {
  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty({ type: () => LocalizedTextInput })
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  title: LocalizedTextInput;

  @ApiProperty({ type: () => LocalizedTextInput })
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  bodyMarkdown: LocalizedTextInput;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: PublishStatus, enumName: 'PublishStatus' })
  @IsOptional()
  @IsEnum(PublishStatus)
  status?: PublishStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  folderId?: string;
}

export class UpdateArticleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ type: () => LocalizedTextInput })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  title?: LocalizedTextInput;

  @ApiPropertyOptional({ type: () => LocalizedTextInput })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  bodyMarkdown?: LocalizedTextInput;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: PublishStatus, enumName: 'PublishStatus' })
  @IsOptional()
  @IsEnum(PublishStatus)
  status?: PublishStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  folderId?: string;
}

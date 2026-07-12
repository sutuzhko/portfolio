import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublishStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { MediaAssetAdminDto } from '../../../common/dto/media-asset-admin.dto';
import {
  LocalizedListDto,
  LocalizedListInput,
  LocalizedListPatch,
  LocalizedTextDto,
  LocalizedTextInput,
  LocalizedTextPatch,
} from '../../../common/i18n/localized.dto';

// Ссылка проекта: label локализован, href — общий.
export class ProjectLinkAdminDto {
  @ApiProperty({ type: () => LocalizedTextDto })
  label: LocalizedTextDto;

  @ApiProperty()
  href: string;
}

export class ProjectLinkInput {
  @ApiProperty({ type: () => LocalizedTextInput })
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  label: LocalizedTextInput;

  @ApiProperty()
  @IsString()
  href: string;
}

export class ProjectAdminDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ type: () => LocalizedTextDto })
  title: LocalizedTextDto;

  @ApiProperty({ type: () => LocalizedTextDto })
  description: LocalizedTextDto;

  @ApiProperty({ type: () => LocalizedTextDto, nullable: true })
  subtitle: LocalizedTextDto | null;

  @ApiProperty({ type: () => LocalizedTextDto })
  bodyMarkdown: LocalizedTextDto;

  @ApiProperty({ type: () => LocalizedListDto, nullable: true })
  bullets: LocalizedListDto | null;

  @ApiProperty({ type: () => LocalizedTextDto, nullable: true })
  role: LocalizedTextDto | null;

  @ApiProperty({ type: String, nullable: true })
  category: string | null;

  @ApiProperty({ type: String, nullable: true })
  period: string | null;

  @ApiProperty({ type: String, nullable: true })
  tileColor: string | null;

  @ApiProperty({ type: () => ProjectLinkAdminDto, isArray: true })
  links: ProjectLinkAdminDto[];

  @ApiProperty()
  runnable: boolean;

  @ApiProperty({ type: String, nullable: true })
  runCommand: string | null;

  @ApiProperty({ type: String, nullable: true })
  embedUrl: string | null;

  @ApiProperty({ type: () => LocalizedTextDto, nullable: true })
  runHint: LocalizedTextDto | null;

  @ApiProperty({ enum: PublishStatus, enumName: 'PublishStatus' })
  status: PublishStatus;

  @ApiProperty()
  hidden: boolean;

  @ApiProperty()
  pinned: boolean;

  @ApiProperty()
  order: number;

  @ApiProperty({ type: String, nullable: true })
  primaryLanguageId: string | null;

  @ApiProperty({ type: [String] })
  technologyIds: string[];

  @ApiProperty({ type: [String] })
  contributorIds: string[];

  @ApiProperty({ type: () => MediaAssetAdminDto, isArray: true })
  gallery: MediaAssetAdminDto[];

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

export class CreateProjectDto {
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
  description: LocalizedTextInput;

  @ApiPropertyOptional({ type: () => LocalizedTextInput })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  subtitle?: LocalizedTextInput;

  @ApiProperty({ type: () => LocalizedTextInput })
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  bodyMarkdown: LocalizedTextInput;

  @ApiPropertyOptional({ type: () => LocalizedListInput })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedListInput)
  bullets?: LocalizedListInput;

  @ApiPropertyOptional({ type: () => LocalizedTextInput })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  role?: LocalizedTextInput;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tileColor?: string;

  @ApiPropertyOptional({ type: () => ProjectLinkInput, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectLinkInput)
  links?: ProjectLinkInput[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  runnable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  runCommand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  embedUrl?: string;

  @ApiPropertyOptional({ type: () => LocalizedTextInput })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  runHint?: LocalizedTextInput;

  @ApiPropertyOptional({ enum: PublishStatus, enumName: 'PublishStatus' })
  @IsOptional()
  @IsEnum(PublishStatus)
  status?: PublishStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryLanguageId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologyIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contributorIds?: string[];
}

// PATCH: те же поля, все опциональны.
export class UpdateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  title?: LocalizedTextPatch;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  description?: LocalizedTextPatch;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  subtitle?: LocalizedTextPatch;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  bodyMarkdown?: LocalizedTextPatch;

  @ApiPropertyOptional({ type: () => LocalizedListPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedListPatch)
  bullets?: LocalizedListPatch;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  role?: LocalizedTextPatch;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tileColor?: string;

  @ApiPropertyOptional({ type: () => ProjectLinkInput, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectLinkInput)
  links?: ProjectLinkInput[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  runnable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  runCommand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  embedUrl?: string;

  @ApiPropertyOptional({ type: () => LocalizedTextPatch })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextPatch)
  runHint?: LocalizedTextPatch;

  @ApiPropertyOptional({ enum: PublishStatus, enumName: 'PublishStatus' })
  @IsOptional()
  @IsEnum(PublishStatus)
  status?: PublishStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryLanguageId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologyIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contributorIds?: string[];
}

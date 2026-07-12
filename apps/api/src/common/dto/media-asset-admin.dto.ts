import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { MediaAsset } from '@prisma/client';
import { MediaType } from '@prisma/client';

import { LocalizedTextDto, readTextNullable } from '../i18n/localized.dto';

export class MediaFormatVariantDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;
}

// Responsive-варианты, сгенерированные при загрузке (для адаптивной отдачи на фронте).
export class MediaFormatsDto {
  @ApiPropertyOptional({ type: () => MediaFormatVariantDto, nullable: true })
  thumbnail?: MediaFormatVariantDto | null;

  @ApiPropertyOptional({ type: () => MediaFormatVariantDto, nullable: true })
  small?: MediaFormatVariantDto | null;

  @ApiPropertyOptional({ type: () => MediaFormatVariantDto, nullable: true })
  medium?: MediaFormatVariantDto | null;

  @ApiPropertyOptional({ type: () => MediaFormatVariantDto, nullable: true })
  large?: MediaFormatVariantDto | null;
}

// Полное admin-представление медиа: оригинал + форматы + метаданные.
export class MediaAssetAdminDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ enum: MediaType, enumName: 'MediaType' })
  type: MediaType;

  @ApiProperty({ type: () => LocalizedTextDto, nullable: true })
  alt: LocalizedTextDto | null;

  @ApiProperty({ type: Number, nullable: true })
  width: number | null;

  @ApiProperty({ type: Number, nullable: true })
  height: number | null;

  @ApiProperty({ type: String, nullable: true })
  mime: string | null;

  @ApiProperty({ type: Number, nullable: true })
  size: number | null;

  @ApiProperty({ type: () => MediaFormatsDto, nullable: true })
  formats: MediaFormatsDto | null;

  @ApiProperty()
  order: number;

  @ApiProperty({ type: String, nullable: true })
  projectId: string | null;
}

function readVariant(value: unknown): MediaFormatVariantDto | null {
  if (value === null || typeof value !== 'object') return null;
  const variant = value as { url?: unknown; width?: unknown; height?: unknown };
  if (
    typeof variant.url === 'string' &&
    typeof variant.width === 'number' &&
    typeof variant.height === 'number'
  ) {
    return { url: variant.url, width: variant.width, height: variant.height };
  }
  return null;
}

function readFormats(value: unknown): MediaFormatsDto | null {
  if (value === null || typeof value !== 'object') return null;
  const formats = value as Record<string, unknown>;
  return {
    thumbnail: readVariant(formats.thumbnail),
    small: readVariant(formats.small),
    medium: readVariant(formats.medium),
    large: readVariant(formats.large),
  };
}

export function readMediaAsset(asset: MediaAsset): MediaAssetAdminDto {
  return {
    id: asset.id,
    url: asset.url,
    type: asset.type,
    alt: readTextNullable(asset.alt),
    width: asset.width,
    height: asset.height,
    mime: asset.mime,
    size: asset.size,
    formats: readFormats(asset.formats),
    order: asset.order,
    projectId: asset.projectId,
  };
}

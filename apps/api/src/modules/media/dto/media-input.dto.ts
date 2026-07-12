import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

import { LocalizedTextInput } from '../../../common/i18n/localized.dto';

// Загрузка изображения галереи (multipart). alt задаётся плоскими полями,
// так как вложенные объекты в multipart передавать неудобно.
export class UploadGalleryDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  altRu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  altEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}

// Кадрирование аватара (multipart). Если переданы все четыре поля — извлекаем
// область; иначе делаем центрированный квадратный кроп.
export class UploadAvatarDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cropX?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cropY?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cropWidth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cropHeight?: number;
}

// PATCH медиа (JSON): alt обеими локалями и/или порядок.
export class UpdateMediaDto {
  @ApiPropertyOptional({ type: () => LocalizedTextInput })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  alt?: LocalizedTextInput;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class AvatarResultDto {
  @ApiProperty()
  avatarPhotoUrl: string;
}

export class CvResultDto {
  @ApiProperty({ description: 'публичный URL загруженного PDF-резюме' })
  url: string;
}

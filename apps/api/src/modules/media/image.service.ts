import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

export interface ImageMeta {
  width: number | null;
  height: number | null;
  format: string | null;
}

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
}

export interface CropBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

const AVATAR_SIZE = 512;
const WEBP_QUALITY = 82;

// Обёртка над sharp: метаданные, ресайз форматов галереи и кадрирование аватара.
@Injectable()
export class ImageService {
  async metadata(buffer: Buffer): Promise<ImageMeta> {
    const meta = await sharp(buffer).metadata();
    return { width: meta.width ?? null, height: meta.height ?? null, format: meta.format ?? null };
  }

  // Уменьшает до заданной ширины (без апскейла), отдаёт webp.
  async resizeToWidth(buffer: Buffer, width: number): Promise<ProcessedImage> {
    const result = await sharp(buffer)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer({ resolveWithObject: true });
    return { buffer: result.data, width: result.info.width, height: result.info.height };
  }

  // Квадратный аватар: по crop-боксу или центрированным cover-кропом.
  async avatar(buffer: Buffer, crop?: CropBox): Promise<ProcessedImage> {
    const pipeline = crop ? sharp(buffer).extract(crop) : sharp(buffer);
    const result = await pipeline
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover' })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer({ resolveWithObject: true });
    return { buffer: result.data, width: result.info.width, height: result.info.height };
  }
}

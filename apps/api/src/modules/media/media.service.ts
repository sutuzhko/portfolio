import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { type MediaAsset, Prisma } from '@prisma/client';

import { MediaAssetAdminDto, readMediaAsset } from '../../common/dto/media-asset-admin.dto';
import { writeText } from '../../common/i18n/localized.dto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AvatarResultDto,
  CvResultDto,
  UpdateMediaDto,
  UploadAvatarDto,
  UploadGalleryDto,
} from './dto/media-input.dto';
import { type CropBox, ImageService } from './image.service';
import { StorageService } from './storage.service';

const PROFILE_ID = 1;

// Спецификации responsive-форматов галереи (ширина в px). Апскейла нет — sharp
// не увеличивает изображения меньше указанной ширины.
const GALLERY_FORMATS: ReadonlyArray<{
  name: 'thumbnail' | 'small' | 'medium' | 'large';
  width: number;
}> = [
  { name: 'thumbnail', width: 160 },
  { name: 'small', width: 480 },
  { name: 'medium', width: 960 },
  { name: 'large', width: 1600 },
];

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly image: ImageService,
  ) {}

  async addGalleryImage(
    file: Express.Multer.File,
    dto: UploadGalleryDto,
  ): Promise<MediaAssetAdminDto> {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) {
      throw new BadRequestException(`Проект "${dto.projectId}" не найден`);
    }

    const meta = await this.image.metadata(file.buffer);
    const url = await this.storage.save(file.buffer, this.extFor(file.mimetype));
    const formats = await this.buildFormats(file.buffer);
    const order =
      dto.order ?? (await this.prisma.mediaAsset.count({ where: { projectId: dto.projectId } }));

    const asset = await this.prisma.mediaAsset.create({
      data: {
        url,
        type: 'GALLERY',
        alt: this.buildAlt(dto.altRu, dto.altEn),
        width: meta.width,
        height: meta.height,
        mime: file.mimetype,
        size: file.size,
        formats,
        order,
        projectId: dto.projectId,
      },
    });
    return readMediaAsset(asset);
  }

  async update(id: string, dto: UpdateMediaDto): Promise<MediaAssetAdminDto> {
    await this.ensure(id);
    const data: Prisma.MediaAssetUpdateInput = {};
    if (dto.alt !== undefined) data.alt = writeText(dto.alt);
    if (dto.order !== undefined) data.order = dto.order;

    const asset = await this.prisma.mediaAsset.update({ where: { id }, data });
    return readMediaAsset(asset);
  }

  async remove(id: string): Promise<void> {
    const asset = await this.ensure(id);
    await this.removeFiles(asset);
    await this.prisma.mediaAsset.delete({ where: { id } });
  }

  async setAvatar(file: Express.Multer.File, dto: UploadAvatarDto): Promise<AvatarResultDto> {
    const processed = await this.image.avatar(file.buffer, this.cropBox(dto)).catch(() => {
      throw new BadRequestException('Некорректная область кадрирования');
    });
    const url = await this.storage.save(processed.buffer, 'webp');

    // Старые аватары и их файлы убираем — храним только актуальный.
    const previous = await this.prisma.mediaAsset.findMany({ where: { type: 'AVATAR' } });
    await Promise.all(previous.map((asset) => this.removeFiles(asset)));
    await this.prisma.mediaAsset.deleteMany({ where: { type: 'AVATAR' } });

    await this.prisma.mediaAsset.create({
      data: {
        url,
        type: 'AVATAR',
        width: processed.width,
        height: processed.height,
        mime: 'image/webp',
        size: processed.buffer.length,
      },
    });
    await this.prisma.profile.update({ where: { id: PROFILE_ID }, data: { avatarPhotoUrl: url } });
    return { avatarPhotoUrl: url };
  }

  // Загрузка PDF-резюме: сохраняем файл и отдаём URL. Локаль проставляет профиль
  // (PATCH /profile мёржит cvUrl.ru/en), поэтому сам профиль здесь не трогаем.
  async uploadCv(file: Express.Multer.File): Promise<CvResultDto> {
    const url = await this.storage.save(file.buffer, 'pdf');
    return { url };
  }

  private async ensure(id: string): Promise<MediaAsset> {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Медиа "${id}" не найдено`);
    }
    return asset;
  }

  private async buildFormats(buffer: Buffer): Promise<Prisma.InputJsonValue> {
    const formats: Record<string, { url: string; width: number; height: number }> = {};
    for (const spec of GALLERY_FORMATS) {
      const variant = await this.image.resizeToWidth(buffer, spec.width);
      const url = await this.storage.save(variant.buffer, 'webp');
      formats[spec.name] = { url, width: variant.width, height: variant.height };
    }
    return formats;
  }

  private async removeFiles(asset: MediaAsset): Promise<void> {
    const urls = [asset.url, ...this.formatUrls(asset.formats)];
    await Promise.all(urls.map((url) => this.storage.remove(url)));
  }

  private formatUrls(value: Prisma.JsonValue): string[] {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return [];
    return Object.values(value)
      .map((variant) =>
        variant !== null && typeof variant === 'object' && !Array.isArray(variant)
          ? (variant as { url?: unknown }).url
          : undefined,
      )
      .filter((url): url is string => typeof url === 'string');
  }

  private cropBox(dto: UploadAvatarDto): CropBox | undefined {
    if (
      dto.cropX !== undefined &&
      dto.cropY !== undefined &&
      dto.cropWidth !== undefined &&
      dto.cropHeight !== undefined
    ) {
      return { left: dto.cropX, top: dto.cropY, width: dto.cropWidth, height: dto.cropHeight };
    }
    return undefined;
  }

  private buildAlt(ru?: string, en?: string): Prisma.InputJsonValue | undefined {
    if (ru === undefined) return undefined;
    return en === undefined ? { ru } : { ru, en };
  }

  private extFor(mime: string): string {
    return EXT_BY_MIME[mime] ?? 'bin';
  }
}

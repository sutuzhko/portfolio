import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const UPLOAD_DIR_DEFAULT = 'uploads';
const PUBLIC_PREFIX = '/uploads';

/**
 * Абстракция хранилища файлов. Текущая реализация — локальный диск; позже её
 * можно заменить на S3, не трогая вызовы (save/remove по публичному URL).
 */
@Injectable()
export class StorageService {
  private readonly dir: string;

  constructor(config: ConfigService) {
    this.dir = resolve(config.get<string>('UPLOAD_DIR') ?? UPLOAD_DIR_DEFAULT);
  }

  // Сохраняет буфер под уникальным именем, возвращает публичный URL (/uploads/<name>).
  async save(buffer: Buffer, ext: string): Promise<string> {
    await mkdir(this.dir, { recursive: true });
    const name = `${randomUUID()}.${ext}`;
    await writeFile(join(this.dir, name), buffer);
    return `${PUBLIC_PREFIX}/${name}`;
  }

  // Удаляет файл по публичному URL; молча игнорирует чужие пути и отсутствие файла.
  async remove(url: string): Promise<void> {
    if (!url.startsWith(`${PUBLIC_PREFIX}/`)) return;
    const name = url.slice(PUBLIC_PREFIX.length + 1);
    if (name.length === 0 || name.includes('/') || name.includes('..')) return;
    try {
      await unlink(join(this.dir, name));
    } catch {
      // Файла уже нет — это не ошибка для идемпотентного удаления.
    }
  }
}

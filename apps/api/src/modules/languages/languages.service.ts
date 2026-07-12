import { Injectable, NotFoundException } from '@nestjs/common';
import type { Language, Prisma } from '@prisma/client';

import { localize } from '../../common/i18n/localize';
import type { Locale } from '../../common/i18n/locale.types';
import { readText, writeText } from '../../common/i18n/localized.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLanguageDto, LanguageAdminDto, UpdateLanguageDto } from './dto/language-admin.dto';
import { LanguageDto } from './dto/language.dto';

@Injectable()
export class LanguagesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(locale: Locale): Promise<LanguageDto[]> {
    const items = await this.prisma.language.findMany({ orderBy: { order: 'asc' } });
    return items.map((item) => ({
      id: item.id,
      name: localize(item.name, locale),
      level: item.level,
      pct: item.pct,
    }));
  }

  // --- admin ---

  async listAdmin(): Promise<LanguageAdminDto[]> {
    const items = await this.prisma.language.findMany({ orderBy: { order: 'asc' } });
    return items.map((item) => this.toAdminDto(item));
  }

  async create(dto: CreateLanguageDto): Promise<LanguageAdminDto> {
    const language = await this.prisma.language.create({
      data: { name: writeText(dto.name), level: dto.level, pct: dto.pct, order: dto.order ?? 0 },
    });
    return this.toAdminDto(language);
  }

  async update(id: string, dto: UpdateLanguageDto): Promise<LanguageAdminDto> {
    await this.ensure(id);
    const data: Prisma.LanguageUpdateInput = {};
    if (dto.name !== undefined) data.name = writeText(dto.name);
    if (dto.level !== undefined) data.level = dto.level;
    if (dto.pct !== undefined) data.pct = dto.pct;
    if (dto.order !== undefined) data.order = dto.order;

    const language = await this.prisma.language.update({ where: { id }, data });
    return this.toAdminDto(language);
  }

  async remove(id: string): Promise<void> {
    await this.ensure(id);
    await this.prisma.language.delete({ where: { id } });
  }

  private async ensure(id: string): Promise<void> {
    const language = await this.prisma.language.findUnique({ where: { id } });
    if (!language) {
      throw new NotFoundException(`Язык "${id}" не найден`);
    }
  }

  private toAdminDto(language: Language): LanguageAdminDto {
    return {
      id: language.id,
      name: readText(language.name),
      level: language.level,
      pct: language.pct,
      order: language.order,
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import type { Education, Prisma } from '@prisma/client';

import { localize, localizeNullable } from '../../common/i18n/localize';
import type { Locale } from '../../common/i18n/locale.types';
import { mergeText, readText, readTextNullable, writeText } from '../../common/i18n/localized.dto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateEducationDto,
  EducationAdminDto,
  UpdateEducationDto,
} from './dto/education-admin.dto';
import { EducationDto } from './dto/education.dto';

@Injectable()
export class EducationService {
  constructor(private readonly prisma: PrismaService) {}

  async list(locale: Locale): Promise<EducationDto[]> {
    const items = await this.prisma.education.findMany({ orderBy: { order: 'asc' } });
    return items.map((item) => ({
      id: item.id,
      type: item.type,
      degree: localize(item.degree, locale),
      place: localizeNullable(item.place, locale),
      period: item.period,
    }));
  }

  // --- admin ---

  async listAdmin(): Promise<EducationAdminDto[]> {
    const items = await this.prisma.education.findMany({ orderBy: { order: 'asc' } });
    return items.map((item) => this.toAdminDto(item));
  }

  async create(dto: CreateEducationDto): Promise<EducationAdminDto> {
    const education = await this.prisma.education.create({
      data: {
        type: dto.type ?? 'MAIN',
        degree: writeText(dto.degree),
        place: dto.place === undefined ? undefined : writeText(dto.place),
        period: dto.period ?? null,
        order: dto.order ?? 0,
      },
    });
    return this.toAdminDto(education);
  }

  async update(id: string, dto: UpdateEducationDto): Promise<EducationAdminDto> {
    // Текущее значение — чтобы патч одной локали не затирал вторую (mergeText).
    const current = await this.load(id);
    const data: Prisma.EducationUpdateInput = {};
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.degree !== undefined) data.degree = mergeText(current.degree, dto.degree);
    if (dto.place !== undefined) data.place = mergeText(current.place, dto.place);
    if (dto.period !== undefined) data.period = dto.period;
    if (dto.order !== undefined) data.order = dto.order;

    const education = await this.prisma.education.update({ where: { id }, data });
    return this.toAdminDto(education);
  }

  async remove(id: string): Promise<void> {
    await this.load(id);
    await this.prisma.education.delete({ where: { id } });
  }

  // Возвращает запись или бросает 404; строку переиспользуют мёрж локалей в
  // update и проверка существования в remove.
  private async load(id: string): Promise<Education> {
    const education = await this.prisma.education.findUnique({ where: { id } });
    if (!education) {
      throw new NotFoundException(`Образование "${id}" не найдено`);
    }
    return education;
  }

  private toAdminDto(education: Education): EducationAdminDto {
    return {
      id: education.id,
      type: education.type,
      degree: readText(education.degree),
      place: readTextNullable(education.place),
      period: education.period,
      order: education.order,
    };
  }
}

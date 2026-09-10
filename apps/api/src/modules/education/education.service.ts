import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

// Таймлайн читается от свежего к давнему: что началось раньше — ниже.
const ORDER_BY: Prisma.EducationOrderByWithRelationInput = { startDate: 'desc' };

// Окончание раньше начала — ошибка ввода, а не «странный» период: отклоняем явно.
function assertPeriod(startDate: Date, endDate: Date | null): void {
  if (endDate !== null && endDate.getTime() < startDate.getTime()) {
    throw new BadRequestException('Дата окончания раньше даты начала');
  }
}

function toDateOrNull(value: string | null): Date | null {
  return value === null ? null : new Date(value);
}

@Injectable()
export class EducationService {
  constructor(private readonly prisma: PrismaService) {}

  async list(locale: Locale): Promise<EducationDto[]> {
    const items = await this.prisma.education.findMany({ orderBy: ORDER_BY });
    return items.map((item) => ({
      id: item.id,
      type: item.type,
      degree: localize(item.degree, locale),
      place: localizeNullable(item.place, locale),
      startDate: item.startDate.toISOString(),
      endDate: item.endDate ? item.endDate.toISOString() : null,
    }));
  }

  // --- admin ---

  async listAdmin(): Promise<EducationAdminDto[]> {
    const items = await this.prisma.education.findMany({ orderBy: ORDER_BY });
    return items.map((item) => this.toAdminDto(item));
  }

  async create(dto: CreateEducationDto): Promise<EducationAdminDto> {
    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : null;
    assertPeriod(startDate, endDate);

    const education = await this.prisma.education.create({
      data: {
        type: dto.type ?? 'MAIN',
        degree: writeText(dto.degree),
        place: dto.place === undefined ? undefined : writeText(dto.place),
        startDate,
        endDate,
      },
    });
    return this.toAdminDto(education);
  }

  async update(id: string, dto: UpdateEducationDto): Promise<EducationAdminDto> {
    // Текущее значение — чтобы патч одной локали не затирал вторую (mergeText) и чтобы
    // проверить период целиком, даже если прислали только одну из дат.
    const current = await this.load(id);
    const startDate = dto.startDate === undefined ? current.startDate : new Date(dto.startDate);
    const endDate = dto.endDate === undefined ? current.endDate : toDateOrNull(dto.endDate);
    assertPeriod(startDate, endDate);

    const data: Prisma.EducationUpdateInput = { startDate, endDate };
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.degree !== undefined) data.degree = mergeText(current.degree, dto.degree);
    if (dto.place !== undefined) data.place = mergeText(current.place, dto.place);

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
      startDate: education.startDate.toISOString(),
      endDate: education.endDate ? education.endDate.toISOString() : null,
    };
  }
}

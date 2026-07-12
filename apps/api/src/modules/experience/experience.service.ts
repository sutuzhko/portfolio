import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { type Experience, Prisma } from '@prisma/client';

import { localize, localizeList, localizeNullable } from '../../common/i18n/localize';
import type { Locale } from '../../common/i18n/locale.types';
import {
  mergeList,
  mergeText,
  readList,
  readText,
  readTextNullable,
  writeList,
  writeText,
} from '../../common/i18n/localized.dto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateExperienceDto,
  ExperienceAdminDto,
  UpdateExperienceDto,
} from './dto/experience-admin.dto';
import { ExperienceDto } from './dto/experience.dto';

const adminInclude = { tech: { orderBy: { order: 'asc' } } } satisfies Prisma.ExperienceInclude;
type ExperiencePayload = Prisma.ExperienceGetPayload<{ include: typeof adminInclude }>;

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  async list(locale: Locale): Promise<ExperienceDto[]> {
    const items = await this.prisma.experience.findMany({
      orderBy: [{ order: 'asc' }, { startDate: 'desc' }],
      include: adminInclude,
    });

    return items.map((item) => ({
      id: item.id,
      role: localize(item.role, locale),
      company: item.company,
      location: localizeNullable(item.location, locale),
      sub: localizeNullable(item.sub, locale),
      bullets: localizeList(item.bullets, locale),
      startDate: item.startDate.toISOString(),
      endDate: item.endDate ? item.endDate.toISOString() : null,
      current: item.current,
      dotColor: item.dotColor,
      technologies: item.tech.map((tech) => tech.name),
    }));
  }

  // --- admin ---

  async listAdmin(): Promise<ExperienceAdminDto[]> {
    const items = await this.prisma.experience.findMany({
      orderBy: [{ order: 'asc' }, { startDate: 'desc' }],
      include: adminInclude,
    });
    return items.map((item) => this.toAdminDto(item));
  }

  async create(dto: CreateExperienceDto): Promise<ExperienceAdminDto> {
    await this.assertTechnologies(dto.technologyIds);

    const experience = await this.prisma.experience.create({
      data: {
        role: writeText(dto.role),
        company: dto.company,
        location: dto.location ? writeText(dto.location) : undefined,
        sub: dto.sub ? writeText(dto.sub) : undefined,
        bullets: writeList(dto.bullets),
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        current: dto.current ?? false,
        dotColor: dto.dotColor ?? null,
        order: dto.order ?? 0,
        tech: dto.technologyIds ? { connect: dto.technologyIds.map((id) => ({ id })) } : undefined,
      },
      include: adminInclude,
    });
    return this.toAdminDto(experience);
  }

  async update(id: string, dto: UpdateExperienceDto): Promise<ExperienceAdminDto> {
    // Текущее значение — чтобы патч одной локали не затирал вторую (mergeText/mergeList).
    const current = await this.load(id);
    await this.assertTechnologies(dto.technologyIds);

    const data: Prisma.ExperienceUpdateInput = {};
    if (dto.role !== undefined) data.role = mergeText(current.role, dto.role);
    if (dto.company !== undefined) data.company = dto.company;
    if (dto.location !== undefined) data.location = mergeText(current.location, dto.location);
    if (dto.sub !== undefined) data.sub = mergeText(current.sub, dto.sub);
    if (dto.bullets !== undefined) data.bullets = mergeList(current.bullets, dto.bullets);
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);
    if (dto.current !== undefined) data.current = dto.current;
    if (dto.dotColor !== undefined) data.dotColor = dto.dotColor;
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.technologyIds !== undefined) {
      data.tech = { set: dto.technologyIds.map((id) => ({ id })) };
    }

    const experience = await this.prisma.experience.update({
      where: { id },
      data,
      include: adminInclude,
    });
    return this.toAdminDto(experience);
  }

  async remove(id: string): Promise<void> {
    await this.load(id);
    await this.prisma.experience.delete({ where: { id } });
  }

  // Возвращает запись опыта или бросает 404; строку переиспользуют мёрж локалей
  // в update и проверка существования в remove.
  private async load(id: string): Promise<Experience> {
    const experience = await this.prisma.experience.findUnique({ where: { id } });
    if (!experience) {
      throw new NotFoundException(`Опыт "${id}" не найден`);
    }
    return experience;
  }

  private async assertTechnologies(technologyIds?: string[]): Promise<void> {
    if (!technologyIds || technologyIds.length === 0) return;
    const ids = [...new Set(technologyIds)];
    const count = await this.prisma.technology.count({ where: { id: { in: ids } } });
    if (count !== ids.length) {
      throw new BadRequestException('Некоторые технологии не найдены');
    }
  }

  private toAdminDto(experience: ExperiencePayload): ExperienceAdminDto {
    return {
      id: experience.id,
      role: readText(experience.role),
      company: experience.company,
      location: readTextNullable(experience.location),
      sub: readTextNullable(experience.sub),
      bullets: readList(experience.bullets),
      startDate: experience.startDate.toISOString(),
      endDate: experience.endDate ? experience.endDate.toISOString() : null,
      current: experience.current,
      dotColor: experience.dotColor,
      order: experience.order,
      technologyIds: experience.tech.map((tech) => tech.id),
    };
  }
}

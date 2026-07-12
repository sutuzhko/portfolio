import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, Skill } from '@prisma/client';

import { localize } from '../../common/i18n/localize';
import type { Locale } from '../../common/i18n/locale.types';
import { mergeText, readText, writeText } from '../../common/i18n/localized.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSkillDto, SkillAdminDto, UpdateSkillDto } from './dto/skill-admin.dto';
import { SkillDto } from './dto/skill.dto';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(locale: Locale): Promise<SkillDto[]> {
    const items = await this.prisma.skill.findMany({ orderBy: { order: 'asc' } });
    return items.map((item) => ({ id: item.id, name: localize(item.name, locale) }));
  }

  // --- admin ---

  async listAdmin(): Promise<SkillAdminDto[]> {
    const items = await this.prisma.skill.findMany({ orderBy: { order: 'asc' } });
    return items.map((item) => this.toAdminDto(item));
  }

  async create(dto: CreateSkillDto): Promise<SkillAdminDto> {
    const skill = await this.prisma.skill.create({
      data: { name: writeText(dto.name), order: dto.order ?? 0 },
    });
    return this.toAdminDto(skill);
  }

  async update(id: string, dto: UpdateSkillDto): Promise<SkillAdminDto> {
    // Текущее значение — чтобы патч одной локали не затирал вторую (mergeText).
    const current = await this.load(id);
    const data: Prisma.SkillUpdateInput = {};
    if (dto.name !== undefined) data.name = mergeText(current.name, dto.name);
    if (dto.order !== undefined) data.order = dto.order;

    const skill = await this.prisma.skill.update({ where: { id }, data });
    return this.toAdminDto(skill);
  }

  async remove(id: string): Promise<void> {
    await this.load(id);
    await this.prisma.skill.delete({ where: { id } });
  }

  // Возвращает навык или бросает 404; строку переиспользуют мёрж локали в
  // update и проверка существования в remove.
  private async load(id: string): Promise<Skill> {
    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) {
      throw new NotFoundException(`Навык "${id}" не найден`);
    }
    return skill;
  }

  private toAdminDto(skill: Skill): SkillAdminDto {
    return { id: skill.id, name: readText(skill.name), order: skill.order };
  }
}

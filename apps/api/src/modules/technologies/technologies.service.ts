import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, Technology } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTechnologyDto,
  TechnologyAdminDto,
  UpdateTechnologyDto,
} from './dto/technology-admin.dto';
import { TechnologyDto } from './dto/technology.dto';

const ORDER_BY: Prisma.TechnologyOrderByWithRelationInput[] = [{ order: 'asc' }, { name: 'asc' }];

@Injectable()
export class TechnologiesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<TechnologyDto[]> {
    const technologies = await this.prisma.technology.findMany({ orderBy: ORDER_BY });
    return technologies.map((tech) => ({
      id: tech.id,
      name: tech.name,
      category: tech.category,
    }));
  }

  // --- admin ---

  async listAdmin(): Promise<TechnologyAdminDto[]> {
    const technologies = await this.prisma.technology.findMany({ orderBy: ORDER_BY });
    return technologies.map((tech) => this.toAdminDto(tech));
  }

  async create(dto: CreateTechnologyDto): Promise<TechnologyAdminDto> {
    const tech = await this.prisma.technology.create({
      data: { name: dto.name, category: dto.category ?? null, order: dto.order ?? 0 },
    });
    return this.toAdminDto(tech);
  }

  async update(id: string, dto: UpdateTechnologyDto): Promise<TechnologyAdminDto> {
    await this.ensure(id);
    const data: Prisma.TechnologyUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.order !== undefined) data.order = dto.order;

    const tech = await this.prisma.technology.update({ where: { id }, data });
    return this.toAdminDto(tech);
  }

  async remove(id: string): Promise<void> {
    await this.ensure(id);
    await this.prisma.technology.delete({ where: { id } });
  }

  private async ensure(id: string): Promise<void> {
    const tech = await this.prisma.technology.findUnique({ where: { id } });
    if (!tech) {
      throw new NotFoundException(`Технология "${id}" не найдена`);
    }
  }

  private toAdminDto(tech: Technology): TechnologyAdminDto {
    return { id: tech.id, name: tech.name, category: tech.category, order: tech.order };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import type { Contributor, Prisma } from '@prisma/client';

import { readText, writeText } from '../../common/i18n/localized.dto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ContributorAdminDto,
  CreateContributorDto,
  UpdateContributorDto,
} from './dto/contributor-admin.dto';

@Injectable()
export class ContributorsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAdmin(): Promise<ContributorAdminDto[]> {
    const items = await this.prisma.contributor.findMany({ orderBy: { order: 'asc' } });
    return items.map((item) => this.toAdminDto(item));
  }

  async create(dto: CreateContributorDto): Promise<ContributorAdminDto> {
    const contributor = await this.prisma.contributor.create({
      data: {
        name: writeText(dto.name),
        image: dto.image ?? null,
        color: dto.color ?? null,
        link: dto.link ?? null,
        order: dto.order ?? 0,
      },
    });
    return this.toAdminDto(contributor);
  }

  async update(id: string, dto: UpdateContributorDto): Promise<ContributorAdminDto> {
    await this.ensure(id);
    const data: Prisma.ContributorUpdateInput = {};
    if (dto.name !== undefined) data.name = writeText(dto.name);
    if (dto.image !== undefined) data.image = dto.image;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.link !== undefined) data.link = dto.link;
    if (dto.order !== undefined) data.order = dto.order;

    const contributor = await this.prisma.contributor.update({ where: { id }, data });
    return this.toAdminDto(contributor);
  }

  async remove(id: string): Promise<void> {
    await this.ensure(id);
    await this.prisma.contributor.delete({ where: { id } });
  }

  private async ensure(id: string): Promise<void> {
    const contributor = await this.prisma.contributor.findUnique({ where: { id } });
    if (!contributor) {
      throw new NotFoundException(`Участник "${id}" не найден`);
    }
  }

  private toAdminDto(contributor: Contributor): ContributorAdminDto {
    return {
      id: contributor.id,
      name: readText(contributor.name),
      image: contributor.image,
      color: contributor.color,
      link: contributor.link,
      order: contributor.order,
    };
  }
}

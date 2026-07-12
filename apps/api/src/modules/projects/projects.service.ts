import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Project } from '@prisma/client';

import type { Locale } from '../../common/i18n/locale.types';
import { mergeList, mergeText, writeList, writeText } from '../../common/i18n/localized.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto, ProjectAdminDto, UpdateProjectDto } from './dto/project-admin.dto';
import { ProjectDetailDto, ProjectListItemDto } from './dto/project.dto';
import {
  projectAdminInclude,
  projectDetailInclude,
  projectListInclude,
  toProjectAdmin,
  toProjectDetail,
  toProjectListItem,
  writeProjectLinks,
} from './projects.mapper';

interface ListParams {
  locale: Locale;
  tech?: string;
  contributor?: string;
  q?: string;
}

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list({ locale, tech, contributor, q }: ListParams): Promise<ProjectListItemDto[]> {
    const where: Prisma.ProjectWhereInput = {
      status: 'PUBLISHED',
      hidden: false,
      ...(tech ? { technologies: { some: { name: tech } } } : {}),
      ...(contributor ? { contributors: { some: { id: contributor } } } : {}),
    };

    const projects = await this.prisma.project.findMany({
      where,
      include: projectListInclude,
      orderBy: [{ pinned: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });

    const items = projects.map((project) => toProjectListItem(project, locale));
    if (!q?.trim()) return items;

    const needle = q.trim().toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle),
    );
  }

  async getBySlug(slug: string, locale: Locale): Promise<ProjectDetailDto> {
    const project = await this.prisma.project.findFirst({
      where: { slug, status: 'PUBLISHED', hidden: false },
      include: projectDetailInclude,
    });

    if (!project) {
      throw new NotFoundException(`Project "${slug}" not found`);
    }

    return toProjectDetail(project, locale);
  }

  // --- admin ---

  async listAdmin(): Promise<ProjectAdminDto[]> {
    const projects = await this.prisma.project.findMany({
      include: projectAdminInclude,
      orderBy: [{ pinned: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });
    return projects.map((project) => toProjectAdmin(project));
  }

  async getAdmin(id: string): Promise<ProjectAdminDto> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: projectAdminInclude,
    });
    if (!project) {
      throw new NotFoundException(`Проект "${id}" не найден`);
    }
    return toProjectAdmin(project);
  }

  async create(dto: CreateProjectDto): Promise<ProjectAdminDto> {
    await this.assertSlugFree(dto.slug);
    await this.assertRelations(dto.primaryLanguageId, dto.technologyIds, dto.contributorIds);

    const project = await this.prisma.project.create({
      data: {
        slug: dto.slug,
        title: writeText(dto.title),
        description: writeText(dto.description),
        subtitle: dto.subtitle ? writeText(dto.subtitle) : undefined,
        bodyMarkdown: writeText(dto.bodyMarkdown),
        bullets: dto.bullets ? writeList(dto.bullets) : undefined,
        role: dto.role ? writeText(dto.role) : undefined,
        category: dto.category ?? null,
        period: dto.period ?? null,
        tileColor: dto.tileColor ?? null,
        links: dto.links ? writeProjectLinks(dto.links) : undefined,
        runnable: dto.runnable ?? false,
        runCommand: dto.runCommand ?? null,
        embedUrl: dto.embedUrl ?? null,
        runHint: dto.runHint ? writeText(dto.runHint) : undefined,
        status: dto.status ?? 'DRAFT',
        hidden: dto.hidden ?? false,
        pinned: dto.pinned ?? false,
        order: dto.order ?? 0,
        primaryLanguage: dto.primaryLanguageId
          ? { connect: { id: dto.primaryLanguageId } }
          : undefined,
        technologies: dto.technologyIds
          ? { connect: dto.technologyIds.map((id) => ({ id })) }
          : undefined,
        contributors: dto.contributorIds
          ? { connect: dto.contributorIds.map((id) => ({ id })) }
          : undefined,
      },
      include: projectAdminInclude,
    });
    return toProjectAdmin(project);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectAdminDto> {
    // Текущее значение нужно для мёржа локализованных полей: патч одной локали
    // не должен затирать вторую (см. mergeText/mergeList).
    const current = await this.load(id);
    if (dto.slug !== undefined) await this.assertSlugFree(dto.slug, id);
    await this.assertRelations(dto.primaryLanguageId, dto.technologyIds, dto.contributorIds);

    const data: Prisma.ProjectUpdateInput = {};
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.title !== undefined) data.title = mergeText(current.title, dto.title);
    if (dto.description !== undefined) {
      data.description = mergeText(current.description, dto.description);
    }
    if (dto.subtitle !== undefined) data.subtitle = mergeText(current.subtitle, dto.subtitle);
    if (dto.bodyMarkdown !== undefined) {
      data.bodyMarkdown = mergeText(current.bodyMarkdown, dto.bodyMarkdown);
    }
    if (dto.bullets !== undefined) data.bullets = mergeList(current.bullets, dto.bullets);
    if (dto.role !== undefined) data.role = mergeText(current.role, dto.role);
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.period !== undefined) data.period = dto.period;
    if (dto.tileColor !== undefined) data.tileColor = dto.tileColor;
    if (dto.links !== undefined) data.links = writeProjectLinks(dto.links);
    if (dto.runnable !== undefined) data.runnable = dto.runnable;
    if (dto.runCommand !== undefined) data.runCommand = dto.runCommand;
    if (dto.embedUrl !== undefined) data.embedUrl = dto.embedUrl;
    if (dto.runHint !== undefined) data.runHint = mergeText(current.runHint, dto.runHint);
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.hidden !== undefined) data.hidden = dto.hidden;
    if (dto.pinned !== undefined) data.pinned = dto.pinned;
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.primaryLanguageId) data.primaryLanguage = { connect: { id: dto.primaryLanguageId } };
    if (dto.technologyIds !== undefined) {
      data.technologies = { set: dto.technologyIds.map((id) => ({ id })) };
    }
    if (dto.contributorIds !== undefined) {
      data.contributors = { set: dto.contributorIds.map((id) => ({ id })) };
    }

    const project = await this.prisma.project.update({
      where: { id },
      data,
      include: projectAdminInclude,
    });
    return toProjectAdmin(project);
  }

  async remove(id: string): Promise<void> {
    await this.load(id);
    await this.prisma.project.delete({ where: { id } });
  }

  // Возвращает проект или бросает 404. Строку переиспользуют мёрж локалей в
  // update и проверка существования в remove — вместо двух запросов.
  private async load(id: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Проект "${id}" не найден`);
    }
    return project;
  }

  private async assertSlugFree(slug: string, exceptId?: string): Promise<void> {
    const existing = await this.prisma.project.findUnique({ where: { slug } });
    if (existing && existing.id !== exceptId) {
      throw new ConflictException(`Проект со slug "${slug}" уже существует`);
    }
  }

  // Проверяем, что все переданные связи существуют, — иначе осмысленный 400 вместо 500.
  private async assertRelations(
    primaryLanguageId?: string,
    technologyIds?: string[],
    contributorIds?: string[],
  ): Promise<void> {
    if (primaryLanguageId) {
      await this.assertCount(
        this.prisma.technology.count({ where: { id: primaryLanguageId } }),
        1,
        'Основной язык не найден',
      );
    }
    if (technologyIds && technologyIds.length > 0) {
      const ids = [...new Set(technologyIds)];
      await this.assertCount(
        this.prisma.technology.count({ where: { id: { in: ids } } }),
        ids.length,
        'Некоторые технологии не найдены',
      );
    }
    if (contributorIds && contributorIds.length > 0) {
      const ids = [...new Set(contributorIds)];
      await this.assertCount(
        this.prisma.contributor.count({ where: { id: { in: ids } } }),
        ids.length,
        'Некоторые участники не найдены',
      );
    }
  }

  private async assertCount(
    countQuery: Promise<number>,
    expected: number,
    message: string,
  ): Promise<void> {
    if ((await countQuery) !== expected) {
      throw new BadRequestException(message);
    }
  }
}

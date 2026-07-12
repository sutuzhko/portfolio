import { Prisma } from '@prisma/client';

import { localize, localizeList, localizeNullable } from '../../common/i18n/localize';
import type { Locale } from '../../common/i18n/locale.types';
import { readMediaAsset } from '../../common/dto/media-asset-admin.dto';
import {
  readListNullable,
  readText,
  readTextNullable,
  writeText,
} from '../../common/i18n/localized.dto';
import { ProjectAdminDto, ProjectLinkAdminDto, ProjectLinkInput } from './dto/project-admin.dto';
import { ProjectDetailDto, ProjectLinkDto, ProjectListItemDto } from './dto/project.dto';

export const projectListInclude = {
  primaryLanguage: true,
  technologies: { orderBy: { order: 'asc' } },
  contributors: { orderBy: { order: 'asc' } },
} satisfies Prisma.ProjectInclude;

export const projectDetailInclude = {
  ...projectListInclude,
  gallery: { orderBy: { order: 'asc' } },
} satisfies Prisma.ProjectInclude;

export const projectAdminInclude = projectDetailInclude;

export type ProjectListPayload = Prisma.ProjectGetPayload<{
  include: typeof projectListInclude;
}>;
export type ProjectDetailPayload = Prisma.ProjectGetPayload<{
  include: typeof projectDetailInclude;
}>;
export type ProjectAdminPayload = ProjectDetailPayload;

function mapLinks(value: unknown, locale: Locale): ProjectLinkDto[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is { label?: unknown; href?: unknown } =>
        typeof item === 'object' && item !== null,
    )
    .filter((item): item is { label?: unknown; href: string } => typeof item.href === 'string')
    .map((item) => ({ label: localize(item.label, locale), href: item.href }));
}

export function toProjectListItem(project: ProjectListPayload, locale: Locale): ProjectListItemDto {
  return {
    slug: project.slug,
    title: localize(project.title, locale),
    description: localize(project.description, locale),
    subtitle: localizeNullable(project.subtitle, locale),
    category: project.category,
    period: project.period,
    tileColor: project.tileColor,
    pinned: project.pinned,
    runnable: project.runnable,
    runCommand: project.runCommand,
    embedUrl: project.embedUrl,
    primaryLanguage: project.primaryLanguage?.name ?? null,
    technologies: project.technologies.map((tech) => tech.name),
    contributors: project.contributors.map((contributor) => ({
      name: localize(contributor.name, locale),
      image: contributor.image,
      color: contributor.color,
      link: contributor.link,
    })),
  };
}

export function toProjectDetail(project: ProjectDetailPayload, locale: Locale): ProjectDetailDto {
  return {
    ...toProjectListItem(project, locale),
    bodyMarkdown: localize(project.bodyMarkdown, locale),
    bullets: localizeList(project.bullets, locale),
    role: localizeNullable(project.role, locale),
    runHint: localizeNullable(project.runHint, locale),
    links: mapLinks(project.links, locale),
    gallery: project.gallery.map((asset) => ({
      url: asset.url,
      alt: localizeNullable(asset.alt, locale),
      width: asset.width,
      height: asset.height,
    })),
  };
}

// --- admin (обе локали) ---

function readProjectLinks(value: unknown): ProjectLinkAdminDto[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is { label?: unknown; href?: unknown } =>
        typeof item === 'object' && item !== null,
    )
    .filter((item): item is { label?: unknown; href: string } => typeof item.href === 'string')
    .map((item) => ({ label: readText(item.label), href: item.href }));
}

export function writeProjectLinks(links: ProjectLinkInput[]): Prisma.InputJsonValue {
  return links.map((link) => ({ label: writeText(link.label), href: link.href }));
}

export function toProjectAdmin(project: ProjectAdminPayload): ProjectAdminDto {
  return {
    id: project.id,
    slug: project.slug,
    title: readText(project.title),
    description: readText(project.description),
    subtitle: readTextNullable(project.subtitle),
    bodyMarkdown: readText(project.bodyMarkdown),
    bullets: readListNullable(project.bullets),
    role: readTextNullable(project.role),
    category: project.category,
    period: project.period,
    tileColor: project.tileColor,
    links: readProjectLinks(project.links),
    runnable: project.runnable,
    runCommand: project.runCommand,
    embedUrl: project.embedUrl,
    runHint: readTextNullable(project.runHint),
    status: project.status,
    hidden: project.hidden,
    pinned: project.pinned,
    order: project.order,
    primaryLanguageId: project.primaryLanguageId,
    technologyIds: project.technologies.map((tech) => tech.id),
    contributorIds: project.contributors.map((contributor) => contributor.id),
    gallery: project.gallery.map((asset) => readMediaAsset(asset)),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

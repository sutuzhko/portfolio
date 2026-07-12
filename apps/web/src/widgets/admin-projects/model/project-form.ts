import type { TFunction } from 'i18next';
import { z } from 'zod';

import type {
  CreateProject,
  ProjectAdmin,
  ProjectLinkInput,
  UpdateProject,
} from '@/entities/project';
import type { AppLanguage } from '@/shared/config';

/** Палитра цветов плитки проекта (тёмная тема, совпадает с плитками главной). */
export const TILE_COLORS: readonly string[] = [
  '#1d6f74',
  '#6b4ca8',
  '#238636',
  '#3c97e8',
  '#a5573e',
  '#8957e5',
  '#c9752b',
];

/** Цвета аватара для нового контрибьютора (яркие, в отличие от заливок плитки). */
export const CONTRIBUTOR_COLORS: readonly string[] = [
  '#238636',
  '#8957e5',
  '#1f6feb',
  '#a371f7',
  '#db6d28',
  '#e0533d',
  '#16a394',
];

type PublishStatus = ProjectAdmin['status'];

/**
 * Схема формы проекта. Локализованные поля (название/описание/тело/роль/буллеты/
 * ссылки) правятся в активной локали; обязательность — только для базовой `ru`.
 * slug и технологии обязательны всегда. Сообщения локализуются → фабрика от `t`.
 */
export function createProjectSchema(t: TFunction, locale: AppLanguage) {
  const requiredForBase = (message: string) =>
    locale === 'ru' ? z.string().trim().min(1, message) : z.string();

  return z.object({
    slug: z
      .string()
      .trim()
      .min(1, t('admin.projects.errors.slug'))
      .regex(/^[a-z0-9-]+$/, t('admin.projects.errors.slugFormat')),
    title: requiredForBase(t('admin.projects.errors.title')),
    description: requiredForBase(t('admin.projects.errors.description')),
    subtitle: z.string(),
    bodyMarkdown: requiredForBase(t('admin.projects.errors.body')),
    role: z.string(),
    category: z.string(),
    period: z.string(),
    bullets: z.string(),
    links: z.string(),
    tileColor: z.string(),
    technologyIds: z.array(z.string()).min(1, t('admin.projects.errors.technologies')),
    contributorIds: z.array(z.string()),
    status: z.enum(['DRAFT', 'PUBLISHED']),
    hidden: z.boolean(),
    pinned: z.boolean(),
    runnable: z.boolean(),
    embedUrl: z.string(),
    runCommand: z.string(),
  });
}

export type ProjectFormValues = z.infer<ReturnType<typeof createProjectSchema>>;

/** Значение локализованного текста в активной локали (фолбэк на ru). */
export function pickText(text: ProjectAdmin['title'] | null, locale: AppLanguage): string {
  if (!text) return '';
  return (locale === 'en' ? text.en : text.ru) ?? text.ru ?? '';
}

function pickList(list: ProjectAdmin['bullets'], locale: AppLanguage): string[] {
  if (!list) return [];
  return (locale === 'en' ? list.en : list.ru) ?? list.ru;
}

function localeInput(locale: AppLanguage, value: string): { ru: string; en?: string } {
  return locale === 'en' ? { ru: value, en: value } : { ru: value };
}

function localeListInput(locale: AppLanguage, value: string[]): { ru: string[]; en?: string[] } {
  return locale === 'en' ? { ru: value, en: value } : { ru: value };
}

function localePatch(locale: AppLanguage, value: string): { ru?: string; en?: string } {
  return locale === 'en' ? { en: value } : { ru: value };
}

function localeListPatch(locale: AppLanguage, value: string[]): { ru?: string[]; en?: string[] } {
  return locale === 'en' ? { en: value } : { ru: value };
}

function toLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// Ссылки: строка «Название | https://…» на строку ↔ массив {label, href}.
function parseLinks(text: string, locale: AppLanguage): ProjectLinkInput[] {
  return toLines(text)
    .map((line) => {
      const sep = line.indexOf('|');
      const label = sep >= 0 ? line.slice(0, sep).trim() : line;
      const href = sep >= 0 ? line.slice(sep + 1).trim() : line;
      return { label: localeInput(locale, label), href };
    })
    .filter((link) => link.href.length > 0);
}

function linksToText(links: ProjectAdmin['links'], locale: AppLanguage): string {
  return links.map((link) => `${pickText(link.label, locale)} | ${link.href}`).join('\n');
}

/** Пустые значения формы для создания нового проекта. */
export function emptyForm(): ProjectFormValues {
  return {
    slug: '',
    title: '',
    description: '',
    subtitle: '',
    bodyMarkdown: '',
    role: '',
    category: '',
    period: '',
    bullets: '',
    links: '',
    tileColor: TILE_COLORS[0] ?? '#1d6f74',
    technologyIds: [],
    contributorIds: [],
    status: 'DRAFT',
    hidden: false,
    pinned: false,
    runnable: false,
    embedUrl: '',
    runCommand: '',
  };
}

/** Админ-проект → значения формы в активной локали. */
export function projectToForm(project: ProjectAdmin, locale: AppLanguage): ProjectFormValues {
  return {
    slug: project.slug,
    title: pickText(project.title, locale),
    description: pickText(project.description, locale),
    subtitle: pickText(project.subtitle, locale),
    bodyMarkdown: pickText(project.bodyMarkdown, locale),
    role: pickText(project.role, locale),
    category: project.category ?? '',
    period: project.period ?? '',
    bullets: pickList(project.bullets, locale).join('\n'),
    links: linksToText(project.links, locale),
    tileColor: project.tileColor ?? TILE_COLORS[0] ?? '#1d6f74',
    technologyIds: [...project.technologyIds],
    contributorIds: [...project.contributorIds],
    status: project.status,
    hidden: project.hidden,
    pinned: project.pinned,
    runnable: project.runnable,
    embedUrl: project.embedUrl ?? '',
    runCommand: project.runCommand ?? '',
  };
}

/** Значения формы → тело создания (`POST /api/projects`). */
export function formToCreate(values: ProjectFormValues, locale: AppLanguage): CreateProject {
  const role = values.role.trim();
  const subtitle = values.subtitle.trim();
  return {
    slug: values.slug.trim(),
    title: localeInput(locale, values.title.trim()),
    description: localeInput(locale, values.description.trim()),
    subtitle: subtitle ? localeInput(locale, subtitle) : undefined,
    bodyMarkdown: localeInput(locale, values.bodyMarkdown.trim()),
    bullets: localeListInput(locale, toLines(values.bullets)),
    role: role ? localeInput(locale, role) : undefined,
    category: values.category.trim() || undefined,
    period: values.period.trim() || undefined,
    tileColor: values.tileColor,
    links: parseLinks(values.links, locale),
    technologyIds: values.technologyIds,
    contributorIds: values.contributorIds,
    status: values.status,
    hidden: values.hidden,
    pinned: values.pinned,
    runnable: values.runnable,
    embedUrl: values.runnable ? values.embedUrl.trim() || undefined : undefined,
    runCommand: values.runnable ? values.runCommand.trim() || undefined : undefined,
  };
}

/** Значения формы → тело обновления (`PATCH /api/projects/:id`, мёрж локали). */
export function formToUpdate(values: ProjectFormValues, locale: AppLanguage): UpdateProject {
  return {
    slug: values.slug.trim(),
    title: localePatch(locale, values.title.trim()),
    description: localePatch(locale, values.description.trim()),
    subtitle: localePatch(locale, values.subtitle.trim()),
    bodyMarkdown: localePatch(locale, values.bodyMarkdown.trim()),
    bullets: localeListPatch(locale, toLines(values.bullets)),
    role: localePatch(locale, values.role.trim()),
    category: values.category.trim(),
    period: values.period.trim(),
    tileColor: values.tileColor,
    links: parseLinks(values.links, locale),
    technologyIds: values.technologyIds,
    contributorIds: values.contributorIds,
    status: values.status,
    hidden: values.hidden,
    pinned: values.pinned,
    runnable: values.runnable,
    embedUrl: values.runnable ? values.embedUrl.trim() : '',
    runCommand: values.runnable ? values.runCommand.trim() : '',
  };
}

export type { PublishStatus };

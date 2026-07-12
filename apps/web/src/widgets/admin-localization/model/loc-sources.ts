/**
 * Реестр источников вкладки «Локализация»: как собрать плоские строки `LocRow` из
 * admin-ответов сущностей и как разложить накопленные правки обратно в PATCH-и по
 * их эндпоинтам. UI-строки приложения (`translation.json`) сюда НЕ входят — они
 * управляются в репозитории на этапе сборки, а не через CMS; локализуется только
 * контент с бэкенда (профиль, проекты, опыт, образование). База знаний исключена
 * по задумке (ведётся на одном языке). Стек пропущен — у технологий нет
 * локализуемых полей.
 */

import type { EducationAdmin, UpdateEducation } from '@/entities/education';
import type { ExperienceAdmin, UpdateExperience } from '@/entities/experience';
import type { ProfileAdmin, UpdateProfile } from '@/entities/profile';
import type { ProjectAdmin, UpdateProject } from '@/entities/project';

import { effective, isChanged, type LocEdits, type LocRow, type LocSourceId } from './loc-rows';

/** Локализованное значение из admin-DTO (обе локали, en — опционален). */
interface Localized {
  readonly ru: string;
  readonly en?: string | null;
}

/** Снимок данных со всех источников (из RTK-кэша контейнера). */
export interface LocData {
  readonly profile?: ProfileAdmin;
  readonly projects?: readonly ProjectAdmin[];
  readonly experiences?: readonly ExperienceAdmin[];
  readonly educations?: readonly EducationAdmin[];
}

/** Локализованные подписи секций (переводятся в контейнере, модель остаётся чистой). */
export interface LocSectionLabels {
  readonly profile: string;
  readonly projectPrefix: string;
  readonly experiencePrefix: string;
  readonly education: string;
}

/** Дескриптор одного локализуемого поля сущности. */
interface FieldSpec<R> {
  /** Имя поля = свойство Update-DTO (адрес PATCH). */
  readonly field: string;
  /** Читатель локализованного значения (null/undefined → строки нет). */
  readonly pick: (record: R) => Localized | null | undefined;
}

// Локализуемые поля профиля (имена = свойства UpdateProfileDto).
const PROFILE_FIELDS = [
  { field: 'name', pick: (p: ProfileAdmin) => p.name },
  { field: 'roleTitle', pick: (p: ProfileAdmin) => p.roleTitle },
  { field: 'headline', pick: (p: ProfileAdmin) => p.headline },
  { field: 'location', pick: (p: ProfileAdmin) => p.location },
  { field: 'bioMarkdown', pick: (p: ProfileAdmin) => p.bioMarkdown },
  { field: 'projectsIntro', pick: (p: ProfileAdmin) => p.projectsIntro },
  { field: 'experienceIntro', pick: (p: ProfileAdmin) => p.experienceIntro },
  { field: 'contactIntro', pick: (p: ProfileAdmin) => p.contactIntro },
] as const satisfies readonly FieldSpec<ProfileAdmin>[];

// Локализуемые поля проекта (имена = свойства UpdateProjectDto).
const PROJECT_FIELDS = [
  { field: 'title', pick: (p: ProjectAdmin) => p.title },
  { field: 'description', pick: (p: ProjectAdmin) => p.description },
  { field: 'bodyMarkdown', pick: (p: ProjectAdmin) => p.bodyMarkdown },
  { field: 'role', pick: (p: ProjectAdmin) => p.role },
  { field: 'runHint', pick: (p: ProjectAdmin) => p.runHint },
] as const satisfies readonly FieldSpec<ProjectAdmin>[];

// Локализуемые поля опыта (имена = свойства UpdateExperienceDto).
const EXPERIENCE_FIELDS = [
  { field: 'role', pick: (e: ExperienceAdmin) => e.role },
  { field: 'location', pick: (e: ExperienceAdmin) => e.location },
  { field: 'sub', pick: (e: ExperienceAdmin) => e.sub },
] as const satisfies readonly FieldSpec<ExperienceAdmin>[];

// Локализуемые поля образования (имена = свойства UpdateEducationDto).
const EDUCATION_FIELDS = [
  { field: 'degree', pick: (e: EducationAdmin) => e.degree },
  { field: 'place', pick: (e: EducationAdmin) => e.place },
] as const satisfies readonly FieldSpec<EducationAdmin>[];

// Ключи полей выводятся из дескрипторов (единый источник правды, литеральные типы).
const PROFILE_KEYS = PROFILE_FIELDS.map((f) => f.field);
const PROJECT_KEYS = PROJECT_FIELDS.map((f) => f.field);
const EXPERIENCE_KEYS = EXPERIENCE_FIELDS.map((f) => f.field);
const EDUCATION_KEYS = EDUCATION_FIELDS.map((f) => f.field);

/** Адрес и подписи строк одной сущности. */
interface RowParams {
  readonly sourceId: LocSourceId;
  readonly entityId: string;
  readonly sectionId: string;
  readonly sectionLabel: string;
  readonly keyPrefix: string;
}

/** Строки одной сущности: по полю с непустым значением (иначе строку не создаём). */
function rowsFor<R>(record: R, fields: readonly FieldSpec<R>[], params: RowParams): LocRow[] {
  const rows: LocRow[] = [];
  for (const spec of fields) {
    const value = spec.pick(record);
    if (value === null || value === undefined) continue;
    rows.push({
      id: `${params.sourceId}:${params.entityId}:${spec.field}`,
      sectionId: params.sectionId,
      sectionLabel: params.sectionLabel,
      sourceId: params.sourceId,
      entityId: params.entityId,
      fieldKey: spec.field,
      label: `${params.keyPrefix}.${spec.field}`,
      ru: value.ru,
      en: value.en ?? '',
    });
  }
  return rows;
}

/** Разворачивает снимок данных в плоский список строк для таблицы сверки. */
export function buildLocRows(data: LocData, labels: LocSectionLabels): LocRow[] {
  const rows: LocRow[] = [];

  if (data.profile) {
    rows.push(
      ...rowsFor(data.profile, PROFILE_FIELDS, {
        sourceId: 'profile',
        entityId: 'profile',
        sectionId: 'profile',
        sectionLabel: labels.profile,
        keyPrefix: 'profile',
      }),
    );
  }

  (data.projects ?? []).forEach((project) => {
    rows.push(
      ...rowsFor(project, PROJECT_FIELDS, {
        sourceId: 'project',
        entityId: project.id,
        sectionId: `project:${project.id}`,
        sectionLabel: `${labels.projectPrefix} · ${project.title.ru}`,
        keyPrefix: `project.${project.slug}`,
      }),
    );
  });

  (data.experiences ?? []).forEach((experience, index) => {
    rows.push(
      ...rowsFor(experience, EXPERIENCE_FIELDS, {
        sourceId: 'experience',
        entityId: experience.id,
        sectionId: `experience:${experience.id}`,
        sectionLabel: `${labels.experiencePrefix} · ${experience.company}`,
        keyPrefix: `experience.${index}`,
      }),
    );
  });

  (data.educations ?? []).forEach((education, index) => {
    rows.push(
      ...rowsFor(education, EDUCATION_FIELDS, {
        sourceId: 'education',
        entityId: education.id,
        sectionId: 'education',
        sectionLabel: labels.education,
        keyPrefix: `education.${index}`,
      }),
    );
  });

  return rows;
}

/** Значение поля для PATCH (обе локали). */
export interface LocFieldValue {
  readonly ru: string;
  readonly en: string;
}

/** Тело PATCH: изменённые поля одной сущности. */
export type LocFieldPatch = Record<string, LocFieldValue>;

/** Один PATCH: адрес сущности + тело из изменённых полей. */
export interface LocSave {
  readonly sourceId: LocSourceId;
  readonly entityId: string;
  readonly body: LocFieldPatch;
}

/**
 * Группирует изменённые строки по сущности в PATCH-и. Тело шлёт обе локали
 * (эффективные значения) — бэкенд мёржит, незатронутая локаль сохраняется.
 */
export function buildSaves(rows: readonly LocRow[], edits: LocEdits): LocSave[] {
  const byEntity = new Map<string, LocSave>();
  for (const row of rows) {
    if (!isChanged(row, edits)) continue;
    const key = `${row.sourceId}:${row.entityId}`;
    const value = effective(row, edits);
    const existing = byEntity.get(key);
    byEntity.set(key, {
      sourceId: row.sourceId,
      entityId: row.entityId,
      body: { ...existing?.body, [row.fieldKey]: value },
    });
  }
  return [...byEntity.values()];
}

/**
 * Собирает типизированное тело PATCH из известных ключей: `Partial<Record<K,…>>`
 * присваивается конкретному Update-DTO без приведения типов (все ключи — валидные
 * локализуемые поля этого DTO).
 */
function pickPatch<K extends string>(
  body: LocFieldPatch,
  keys: readonly K[],
): Partial<Record<K, LocFieldValue>> {
  const out: Partial<Record<K, LocFieldValue>> = {};
  for (const key of keys) {
    const value = body[key];
    if (value) out[key] = value;
  }
  return out;
}

/** Триггеры мутаций (тонкие обёртки над RTK Query, передаёт контейнер). */
export interface LocMutations {
  readonly updateProfile: (body: UpdateProfile) => Promise<unknown>;
  readonly updateProject: (id: string, body: UpdateProject) => Promise<unknown>;
  readonly updateExperience: (id: string, body: UpdateExperience) => Promise<unknown>;
  readonly updateEducation: (id: string, body: UpdateEducation) => Promise<unknown>;
}

/** Раскидывает PATCH-и по эндпоинтам источников. Пробрасывает первую ошибку. */
export async function applySaves(
  saves: readonly LocSave[],
  mutations: LocMutations,
): Promise<void> {
  for (const save of saves) {
    switch (save.sourceId) {
      case 'profile':
        await mutations.updateProfile(pickPatch(save.body, PROFILE_KEYS));
        break;
      case 'project':
        await mutations.updateProject(save.entityId, pickPatch(save.body, PROJECT_KEYS));
        break;
      case 'experience':
        await mutations.updateExperience(save.entityId, pickPatch(save.body, EXPERIENCE_KEYS));
        break;
      case 'education':
        await mutations.updateEducation(save.entityId, pickPatch(save.body, EDUCATION_KEYS));
        break;
    }
  }
}

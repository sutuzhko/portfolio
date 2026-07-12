import type { TFunction } from 'i18next';
import { z } from 'zod';

import type { CreateExperience, ExperienceAdmin, UpdateExperience } from '@/entities/experience';
import type { AppLanguage } from '@/shared/config';

/**
 * Схема формы места работы. Локализованные поля (роль, локация, буллеты) правятся
 * в АКТИВНОЙ локали; обязательность держим только для базовой локали `ru`.
 * Компания и дата начала обязательны всегда (не локализованы). Схема — фабрика от
 * `t` и локали, чтобы сообщения локализовались.
 */
export function createExperienceSchema(t: TFunction, locale: AppLanguage) {
  const requiredForBase = (message: string) =>
    locale === 'ru' ? z.string().trim().min(1, message) : z.string();

  return z.object({
    company: z.string().trim().min(1, t('admin.experience.errors.company')),
    role: requiredForBase(t('admin.experience.errors.role')),
    location: z.string(),
    startDate: z.string().trim().min(1, t('admin.experience.errors.startDate')),
    endDate: z.string(),
    current: z.boolean(),
    bullets: z.string(),
    technologyIds: z.array(z.string()),
  });
}

export type ExperienceFormValues = z.infer<ReturnType<typeof createExperienceSchema>>;

/** Значение локализованного текста в активной локали (фолбэк на ru). */
export function pickText(text: ExperienceAdmin['role'] | null, locale: AppLanguage): string {
  if (!text) return '';
  return (locale === 'en' ? text.en : text.ru) ?? text.ru ?? '';
}

function pickList(list: ExperienceAdmin['bullets'], locale: AppLanguage): string[] {
  return (locale === 'en' ? list.en : list.ru) ?? list.ru;
}

// ISO date-time → YYYY-MM для <input type="month"> (и обратно первым числом месяца).
function toMonth(iso: string | null): string {
  return iso ? iso.slice(0, 7) : '';
}

function toIso(month: string): string {
  return `${month}-01T00:00:00.000Z`;
}

// Достижения: строка textarea ↔ массив (по строке на буллет, пустые отбрасываем).
function toBullets(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// Ввод локализованного текста при создании: база ru всегда заполнена (публичный
// фолбэк идёт на ru), при правке en значение дублируется в ru.
function localeInput(locale: AppLanguage, value: string): { ru: string; en?: string } {
  return locale === 'en' ? { ru: value, en: value } : { ru: value };
}

function localeListInput(locale: AppLanguage, value: string[]): { ru: string[]; en?: string[] } {
  return locale === 'en' ? { ru: value, en: value } : { ru: value };
}

// Патч одной локали: в PATCH уходит только активный язык, второй мёржится на бэке.
function localePatch(locale: AppLanguage, value: string): { ru?: string; en?: string } {
  return locale === 'en' ? { en: value } : { ru: value };
}

function localeListPatch(locale: AppLanguage, value: string[]): { ru?: string[]; en?: string[] } {
  return locale === 'en' ? { en: value } : { ru: value };
}

/** Пустые значения формы для создания новой записи. */
export function emptyForm(): ExperienceFormValues {
  return {
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    bullets: '',
    technologyIds: [],
  };
}

/** Админ-запись → значения формы в активной локали. */
export function experienceToForm(
  record: ExperienceAdmin,
  locale: AppLanguage,
): ExperienceFormValues {
  return {
    company: record.company,
    role: pickText(record.role, locale),
    location: pickText(record.location, locale),
    startDate: toMonth(record.startDate),
    endDate: toMonth(record.endDate),
    current: record.current,
    bullets: pickList(record.bullets, locale).join('\n'),
    technologyIds: [...record.technologyIds],
  };
}

/** Значения формы → тело создания (`POST /api/experience`). */
export function formToCreate(values: ExperienceFormValues, locale: AppLanguage): CreateExperience {
  const location = values.location.trim();
  return {
    company: values.company.trim(),
    role: localeInput(locale, values.role.trim()),
    location: location ? localeInput(locale, location) : undefined,
    bullets: localeListInput(locale, toBullets(values.bullets)),
    startDate: toIso(values.startDate),
    endDate: values.current || !values.endDate ? undefined : toIso(values.endDate),
    current: values.current,
    technologyIds: values.technologyIds,
  };
}

/** Значения формы → тело обновления (`PATCH /api/experience/:id`, мёрж локали). */
export function formToUpdate(values: ExperienceFormValues, locale: AppLanguage): UpdateExperience {
  const update: UpdateExperience = {
    company: values.company.trim(),
    role: localePatch(locale, values.role.trim()),
    location: localePatch(locale, values.location.trim()),
    bullets: localeListPatch(locale, toBullets(values.bullets)),
    startDate: toIso(values.startDate),
    current: values.current,
    technologyIds: values.technologyIds,
  };
  // endDate нельзя обнулить через DTO — при «текущем» опускаем (флаг current
  // управляет отображением «наст. время»), иначе шлём конкретный месяц.
  if (!values.current && values.endDate) update.endDate = toIso(values.endDate);
  return update;
}

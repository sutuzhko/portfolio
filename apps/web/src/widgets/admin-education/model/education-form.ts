import type {
  CreateEducation,
  EducationAdmin,
  EducationType,
  UpdateEducation,
} from '@/entities/education';
import type { AppLanguage } from '@/shared/config';
import { isoToMonthInput, monthInputToIso } from '@/shared/lib';

/**
 * Строка редактора образования (всегда редактируемая; `id: null` — новая запись).
 * Даты — значения `<input type="month">` (YYYY-MM, пустая строка — не задана).
 */
export interface EducationRow {
  readonly key: string;
  readonly id: string | null;
  readonly type: EducationType;
  readonly degree: string;
  readonly place: string;
  readonly startMonth: string;
  readonly endMonth: string;
}

const ERROR_KEYS = {
  startRequired: 'admin.education.errors.startRequired',
  endBeforeStart: 'admin.education.errors.endBeforeStart',
} as const;

/** Ключ i18n ошибки периода. */
export type EducationErrorKey = (typeof ERROR_KEYS)[keyof typeof ERROR_KEYS];

/** Ошибки периода строки по полям (ключи i18n). */
export interface EducationRowErrors {
  readonly startMonth?: EducationErrorKey;
  readonly endMonth?: EducationErrorKey;
}

/** Значение локализованного текста в активной локали (фолбэк на ru). */
function pick(text: EducationAdmin['degree'] | null, locale: AppLanguage): string {
  if (!text) return '';
  return (locale === 'en' ? text.en : text.ru) ?? text.ru ?? '';
}

// Ввод при создании: база ru всегда заполнена (публичный фолбэк идёт на ru),
// при правке en значение дублируется в ru.
function localeInput(locale: AppLanguage, value: string): { ru: string; en?: string } {
  return locale === 'en' ? { ru: value, en: value } : { ru: value };
}

// Патч одной локали: в PATCH уходит только активный язык, второй мёржится на бэке.
function localePatch(locale: AppLanguage, value: string): { ru?: string; en?: string } {
  return locale === 'en' ? { en: value } : { ru: value };
}

let counter = 0;

/** Уникальный локальный ключ для новой строки (id ещё нет). */
export function newRowKey(): string {
  counter += 1;
  return `new-${counter}`;
}

/** Пустая строка для добавления записи заданного типа. */
export function emptyRow(type: EducationType): EducationRow {
  return { key: newRowKey(), id: null, type, degree: '', place: '', startMonth: '', endMonth: '' };
}

/** Админ-записи → строки редактора в активной локали. */
export function buildRows(items: readonly EducationAdmin[], locale: AppLanguage): EducationRow[] {
  return items.map((item) => ({
    key: item.id,
    id: item.id,
    type: item.type,
    degree: pick(item.degree, locale),
    place: pick(item.place, locale),
    startMonth: isoToMonthInput(item.startDate),
    endMonth: isoToMonthInput(item.endDate),
  }));
}

/** Уйдёт ли строка на сохранение: существующая — всегда, новая — только с названием. */
export function isSubmittable(row: EducationRow): boolean {
  return row.id !== null || row.degree.trim() !== '';
}

/**
 * Ошибки периода: дата начала обязательна (по ней сортируется таймлайн), окончание —
 * не раньше начала (YYYY-MM сравниваются как строки). Незаполненная новая строка не
 * проверяется — она и не уйдёт на сохранение.
 */
export function validateRow(row: EducationRow): EducationRowErrors {
  if (!isSubmittable(row)) return {};
  if (row.startMonth === '') return { startMonth: ERROR_KEYS.startRequired };
  if (row.endMonth !== '' && row.endMonth < row.startMonth) {
    return { endMonth: ERROR_KEYS.endBeforeStart };
  }
  return {};
}

/** Есть ли у строки ошибки периода (гейт «Сохранить»). */
export function hasRowErrors(row: EducationRow): boolean {
  const errors = validateRow(row);
  return errors.startMonth !== undefined || errors.endMonth !== undefined;
}

/** Строка → тело создания записи. */
export function rowToCreate(row: EducationRow, locale: AppLanguage): CreateEducation {
  const place = row.place.trim();
  return {
    type: row.type,
    degree: localeInput(locale, row.degree.trim()),
    place: place ? localeInput(locale, place) : undefined,
    startDate: monthInputToIso(row.startMonth),
    endDate: row.endMonth ? monthInputToIso(row.endMonth) : undefined,
  };
}

/** Строка → тело обновления записи (мёрж локали на бэке). */
export function rowToUpdate(row: EducationRow, locale: AppLanguage): UpdateEducation {
  return {
    type: row.type,
    degree: localePatch(locale, row.degree.trim()),
    place: localePatch(locale, row.place.trim()),
    startDate: monthInputToIso(row.startMonth),
    // Пустое окончание снимает дату (null), а не означает «не менять».
    endDate: row.endMonth ? monthInputToIso(row.endMonth) : null,
  };
}

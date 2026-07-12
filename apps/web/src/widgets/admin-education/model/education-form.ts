import type {
  CreateEducation,
  EducationAdmin,
  EducationType,
  UpdateEducation,
} from '@/entities/education';
import type { AppLanguage } from '@/shared/config';

/** Строка редактора образования (всегда редактируемая; `id: null` — новая запись). */
export interface EducationRow {
  readonly key: string;
  readonly id: string | null;
  readonly type: EducationType;
  readonly degree: string;
  readonly place: string;
  readonly period: string;
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
  return { key: newRowKey(), id: null, type, degree: '', place: '', period: '' };
}

/** Админ-записи → строки редактора в активной локали. */
export function buildRows(items: readonly EducationAdmin[], locale: AppLanguage): EducationRow[] {
  return items.map((item) => ({
    key: item.id,
    id: item.id,
    type: item.type,
    degree: pick(item.degree, locale),
    place: pick(item.place, locale),
    period: item.period ?? '',
  }));
}

/** Строка → тело создания записи. */
export function rowToCreate(row: EducationRow, locale: AppLanguage): CreateEducation {
  const place = row.place.trim();
  return {
    type: row.type,
    degree: localeInput(locale, row.degree.trim()),
    place: place ? localeInput(locale, place) : undefined,
    period: row.period.trim() || undefined,
  };
}

/** Строка → тело обновления записи (мёрж локали на бэке). */
export function rowToUpdate(row: EducationRow, locale: AppLanguage): UpdateEducation {
  return {
    type: row.type,
    degree: localePatch(locale, row.degree.trim()),
    place: localePatch(locale, row.place.trim()),
    period: row.period.trim(),
  };
}

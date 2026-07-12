import type { components } from '@portfolio/contract';

/** Владение языком (локализованный ответ `GET /api/languages`). */
export type Language = components['schemas']['LanguageDto'];

/** Язык в админ-виде: обе локали названия + порядок. */
export type LanguageAdmin = components['schemas']['LanguageAdminDto'];

/** Тело создания языка. */
export type CreateLanguage = components['schemas']['CreateLanguageDto'];

/** Тело обновления языка (частичное). */
export type UpdateLanguage = components['schemas']['UpdateLanguageDto'];

/** Локализованный текст `{ ru, en? }` (ответ). */
export type LocalizedText = components['schemas']['LocalizedTextDto'];

/** Локализованный ввод `{ ru, en? }` (запрос). */
export type LocalizedTextInput = components['schemas']['LocalizedTextInput'];

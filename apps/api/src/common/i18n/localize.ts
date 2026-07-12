import {
  DEFAULT_LOCALE,
  type Locale,
  type LocalizedList,
  type LocalizedText,
} from './locale.types';

// Возвращает строку нужной локали из хранимого LocalizedText, с откатом на ru.
export function localize(value: unknown, locale: Locale): string {
  if (typeof value === 'string') return value;
  if (value === null || typeof value !== 'object') return '';
  const text = value as Partial<LocalizedText>;
  return (locale === DEFAULT_LOCALE ? text.ru : text[locale]) ?? text.ru ?? '';
}

// То же, что localize, но для пустых/отсутствующих значений возвращает null.
export function localizeNullable(value: unknown, locale: Locale): string | null {
  if (value === null || value === undefined) return null;
  const resolved = localize(value, locale);
  return resolved.length > 0 ? resolved : null;
}

// Возвращает массив строк нужной локали из хранимого LocalizedList, с откатом на ru.
export function localizeList(value: unknown, locale: Locale): string[] {
  if (value === null || typeof value !== 'object') return [];
  const list = value as Partial<LocalizedList>;
  return (locale === DEFAULT_LOCALE ? list.ru : list[locale]) ?? list.ru ?? [];
}

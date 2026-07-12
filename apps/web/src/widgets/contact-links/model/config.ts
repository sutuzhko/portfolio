/**
 * Отображение канала связи по типу иконки из бэкенда. Бренд-названия и
 * аббревиатуры-бейджи одинаковы в обеих локалях, поэтому живут в конфиге виджета,
 * а не в i18n. Неизвестный канал деградирует к сокращению из самого значения.
 */
const BADGES: Record<string, string> = {
  telegram: 'TG',
  github: 'GH',
  codewars: 'CW',
  email: '@',
  linkedin: 'in',
};

const LABELS: Record<string, string> = {
  telegram: 'Telegram',
  github: 'GitHub',
  codewars: 'Codewars',
  email: 'Email',
  linkedin: 'LinkedIn',
};

/** Короткий бейдж канала (фолбэк — первые две буквы типа). */
export function contactBadge(icon: string): string {
  return BADGES[icon] ?? icon.slice(0, 2).toUpperCase();
}

/** Название канала (фолбэк — тип с заглавной буквы). */
export function contactLabel(icon: string): string {
  return LABELS[icon] ?? `${icon.charAt(0).toUpperCase()}${icon.slice(1)}`;
}

/** Человекочитаемое значение из URL: без протокола, `mailto:`, `www.` и слэша. */
export function contactValue(url: string): string {
  return url
    .replace(/^mailto:/, '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}

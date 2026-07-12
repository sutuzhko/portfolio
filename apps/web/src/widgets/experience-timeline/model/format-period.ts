import type { AppLanguage } from '@/shared/config';

/**
 * Форматирует диапазон работы по локали: «янв. 2021 — наст. время» /
 * «Jan 2019 – Jan 2021». Метку «настоящего» передаём из i18n.
 */
export function formatPeriod(
  startDate: string,
  endDate: string | null,
  current: boolean,
  language: AppLanguage,
  presentLabel: string,
): string {
  const format = (iso: string): string =>
    new Intl.DateTimeFormat(language, { month: 'short', year: 'numeric' }).format(new Date(iso));

  const end = current || endDate === null ? presentLabel : format(endDate);
  return `${format(startDate)} — ${end}`;
}

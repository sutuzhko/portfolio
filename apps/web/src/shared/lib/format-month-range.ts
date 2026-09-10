import type { AppLanguage } from '@/shared/config';

/**
 * Период «месяц год — месяц год» по локали: «сент. 2022 г. — июль 2024 г.» /
 * «Sep 2022 — Jul 2024». Даты периодов хранятся первым числом месяца в UTC, поэтому и
 * форматируем в UTC — иначе западнее Гринвича месяц съезжает на предыдущий.
 * Без даты окончания: с `openEndLabel` — «… — наст. время», без него — только начало.
 */
export function formatMonthRange(
  startDate: string,
  endDate: string | null,
  language: AppLanguage,
  openEndLabel?: string,
): string {
  const format = new Intl.DateTimeFormat(language, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const start = format.format(new Date(startDate));
  if (endDate !== null) return `${start} — ${format.format(new Date(endDate))}`;
  return openEndLabel === undefined ? start : `${start} — ${openEndLabel}`;
}

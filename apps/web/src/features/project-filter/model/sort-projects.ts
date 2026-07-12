import type { ProjectListItem } from '@/entities/project';

/** Порядок отображения проектов, выбираемый посетителем. */
export type ProjectSortKey = 'default' | 'name' | 'newest';

export const PROJECT_SORT_KEYS: readonly ProjectSortKey[] = ['default', 'name', 'newest'];

/** Год из строки периода («2021», «2023–2024») — для сортировки по свежести. */
function periodYear(period: string | null): number {
  const match = period?.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

/**
 * Клиентская сортировка списка проектов. `default` сохраняет серверный
 * (курируемый) порядок — избранные и `order`. Не мутирует вход.
 */
export function sortProjects(
  projects: readonly ProjectListItem[],
  key: ProjectSortKey,
): readonly ProjectListItem[] {
  if (key === 'default') return projects;
  const sorted = [...projects];
  if (key === 'name') {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    sorted.sort((a, b) => periodYear(b.period) - periodYear(a.period));
  }
  return sorted;
}

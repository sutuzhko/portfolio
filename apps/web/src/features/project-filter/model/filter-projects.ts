import type { ProjectListItem } from '@/entities/project';

import type { ProjectFilterState } from './types';

/** Пустое состояние фильтра (ни один критерий не активен). */
export const EMPTY_FILTER: ProjectFilterState = { query: '', techs: [], contributors: [] };

/** Есть ли хотя бы один активный критерий. */
export function hasActiveFilters(state: ProjectFilterState): boolean {
  return state.query.trim() !== '' || state.techs.length > 0 || state.contributors.length > 0;
}

/**
 * Фильтрует проекты по запросу (title/description), технологиям и контрибьюторам.
 * Внутри фасета — «ИЛИ» (проект подходит, если содержит любой из выбранных),
 * между фасетами и запросом — «И». Пустой фасет ограничений не накладывает.
 */
export function filterProjects(
  projects: readonly ProjectListItem[],
  state: ProjectFilterState,
): readonly ProjectListItem[] {
  const query = state.query.trim().toLowerCase();

  return projects.filter((project) => {
    const matchesQuery =
      query === '' ||
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query);

    const matchesTechs =
      state.techs.length === 0 || state.techs.some((tech) => project.technologies.includes(tech));

    const matchesContributors =
      state.contributors.length === 0 ||
      state.contributors.some((name) =>
        project.contributors.some((contributor) => contributor.name === name),
      );

    return matchesQuery && matchesTechs && matchesContributors;
  });
}

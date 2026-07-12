import { useMemo, useState } from 'react';

import type { ProjectListItem } from '@/entities/project';

import { collectContributorOptions, collectTechOptions } from './derive-filter-options';
import { EMPTY_FILTER, filterProjects, hasActiveFilters } from './filter-projects';
import type { ProjectFilterState } from './types';

/** Публичный контроллер фильтра: состояние, производный список и действия. */
export interface ProjectFilter {
  readonly state: ProjectFilterState;
  readonly filtered: readonly ProjectListItem[];
  readonly techOptions: readonly string[];
  readonly contributorOptions: readonly string[];
  readonly hasFilters: boolean;
  readonly setQuery: (query: string) => void;
  readonly toggleTech: (tech: string) => void;
  readonly toggleContributor: (name: string) => void;
  readonly clear: () => void;
}

function toggle(list: readonly string[], value: string): readonly string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/**
 * Управляет состоянием фильтра проектов и отдаёт отфильтрованный список + опции
 * фасетов. Состояние локальное (принадлежит экрану); фильтрация — на клиенте
 * (набор проектов мал, мгновенный отклик без перезапроса).
 */
export function useProjectFilter(projects: readonly ProjectListItem[]): ProjectFilter {
  const [state, setState] = useState<ProjectFilterState>(EMPTY_FILTER);

  const techOptions = useMemo(() => collectTechOptions(projects), [projects]);
  const contributorOptions = useMemo(() => collectContributorOptions(projects), [projects]);
  const filtered = useMemo(() => filterProjects(projects, state), [projects, state]);

  return {
    state,
    filtered,
    techOptions,
    contributorOptions,
    hasFilters: hasActiveFilters(state),
    setQuery: (query) => {
      setState((prev) => ({ ...prev, query }));
    },
    toggleTech: (tech) => {
      setState((prev) => ({ ...prev, techs: toggle(prev.techs, tech) }));
    },
    toggleContributor: (name) => {
      setState((prev) => ({ ...prev, contributors: toggle(prev.contributors, name) }));
    },
    clear: () => {
      setState(EMPTY_FILTER);
    },
  };
}

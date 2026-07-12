import { describe, expect, it } from 'vitest';

import type { ProjectListItem } from '@/entities/project';

import { collectContributorOptions, collectTechOptions } from './derive-filter-options';
import { EMPTY_FILTER, filterProjects, hasActiveFilters } from './filter-projects';

function makeProject(overrides: Partial<ProjectListItem> = {}): ProjectListItem {
  return {
    slug: 'project',
    title: 'Project',
    description: 'Description',
    subtitle: null,
    category: null,
    period: null,
    tileColor: null,
    pinned: false,
    runnable: false,
    runCommand: null,
    embedUrl: null,
    primaryLanguage: null,
    technologies: [],
    contributors: [],
    ...overrides,
  };
}

const deepFocus = makeProject({
  slug: 'deep-focus',
  title: 'Deep Focus',
  description: 'Pomodoro-трекер',
  technologies: ['React', 'TypeScript'],
  contributors: [{ name: 'Bogdan', image: null, color: null, link: null }],
});

const uiKit = makeProject({
  slug: 'ui-kit',
  title: 'UI Kit',
  description: 'Библиотека компонентов на Vue',
  technologies: ['Vue', 'Storybook'],
  contributors: [{ name: 'Anna', image: null, color: null, link: null }],
});

const projects = [deepFocus, uiKit];

describe('filterProjects', () => {
  it('без активных критериев возвращает все проекты', () => {
    expect(filterProjects(projects, EMPTY_FILTER)).toEqual(projects);
  });

  it('ищет по названию регистронезависимо', () => {
    expect(filterProjects(projects, { ...EMPTY_FILTER, query: 'deep' })).toEqual([deepFocus]);
  });

  it('ищет по описанию', () => {
    expect(filterProjects(projects, { ...EMPTY_FILTER, query: 'pomodoro' })).toEqual([deepFocus]);
  });

  it('при отсутствии совпадений возвращает пустой список', () => {
    expect(filterProjects(projects, { ...EMPTY_FILTER, query: 'нет такого' })).toEqual([]);
  });

  it('технологии внутри фасета работают по «ИЛИ» (объединение)', () => {
    expect(filterProjects(projects, { ...EMPTY_FILTER, techs: ['React', 'Vue'] })).toEqual(
      projects,
    );
    expect(filterProjects(projects, { ...EMPTY_FILTER, techs: ['Vue'] })).toEqual([uiKit]);
  });

  it('фильтрует по контрибьютору', () => {
    expect(filterProjects(projects, { ...EMPTY_FILTER, contributors: ['Anna'] })).toEqual([uiKit]);
  });

  it('запрос и фасет комбинируются по «И»', () => {
    expect(filterProjects(projects, { query: 'kit', techs: ['React'], contributors: [] })).toEqual(
      [],
    );
    expect(filterProjects(projects, { query: 'kit', techs: ['Vue'], contributors: [] })).toEqual([
      uiKit,
    ]);
  });
});

describe('hasActiveFilters', () => {
  it('false для пустого состояния и пробельного запроса', () => {
    expect(hasActiveFilters(EMPTY_FILTER)).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_FILTER, query: '   ' })).toBe(false);
  });

  it('true при любом активном критерии', () => {
    expect(hasActiveFilters({ ...EMPTY_FILTER, query: 'x' })).toBe(true);
    expect(hasActiveFilters({ ...EMPTY_FILTER, techs: ['React'] })).toBe(true);
    expect(hasActiveFilters({ ...EMPTY_FILTER, contributors: ['Anna'] })).toBe(true);
  });
});

describe('collect*Options', () => {
  it('собирает уникальные технологии в порядке появления', () => {
    expect(collectTechOptions(projects)).toEqual(['React', 'TypeScript', 'Vue', 'Storybook']);
  });

  it('собирает уникальные имена контрибьюторов', () => {
    expect(collectContributorOptions(projects)).toEqual(['Bogdan', 'Anna']);
  });
});

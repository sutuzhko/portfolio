import { describe, expect, it } from 'vitest';

import type { ProjectListItem } from '@/entities/project';

import { sortProjects } from './sort-projects';

function project(title: string, period: string | null): ProjectListItem {
  return {
    slug: title.toLowerCase(),
    title,
    description: '',
    subtitle: null,
    category: null,
    period,
    tileColor: null,
    pinned: false,
    runnable: false,
    runCommand: null,
    embedUrl: null,
    primaryLanguage: null,
    technologies: [],
    contributors: [],
  };
}

const list: ProjectListItem[] = [
  project('Gamma', '2021'),
  project('Alpha', '2025'),
  project('Beta', '2023'),
];

describe('sortProjects', () => {
  it('default сохраняет исходный порядок и не мутирует вход', () => {
    const result = sortProjects(list, 'default');
    expect(result).toBe(list);
    expect(list.map((p) => p.title)).toEqual(['Gamma', 'Alpha', 'Beta']);
  });

  it('name сортирует по названию А→Я', () => {
    const result = sortProjects(list, 'name');
    expect(result.map((p) => p.title)).toEqual(['Alpha', 'Beta', 'Gamma']);
    // Вход не изменён.
    expect(list.map((p) => p.title)).toEqual(['Gamma', 'Alpha', 'Beta']);
  });

  it('newest сортирует по году периода (сначала новые)', () => {
    const result = sortProjects(list, 'newest');
    expect(result.map((p) => p.title)).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('проекты без периода уходят в конец при newest', () => {
    const withNull = [project('NoDate', null), project('Y2020', '2020')];
    expect(sortProjects(withNull, 'newest').map((p) => p.title)).toEqual(['Y2020', 'NoDate']);
  });
});

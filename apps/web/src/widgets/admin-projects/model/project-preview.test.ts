import { describe, expect, it } from 'vitest';

import type { ContributorAdmin } from '@/entities/contributor';
import type { TechnologyAdmin } from '@/entities/technology';

import { emptyForm, type ProjectFormValues } from './project-form';
import { formToTile } from './project-preview';

const technologies: TechnologyAdmin[] = [
  { id: 't1', name: 'React', category: 'frontend', order: 0 },
  { id: 't2', name: 'NestJS', category: 'backend', order: 1 },
];

const contributors: ContributorAdmin[] = [
  {
    id: 'c1',
    name: { ru: 'Богдан Сутужко', en: 'Bogdan Sutuzhko' },
    image: null,
    color: '#238636',
    link: null,
    order: 0,
  },
];

const FALLBACKS = { title: 'Новый проект', description: 'Краткое описание проекта' };

function form(overrides: Partial<ProjectFormValues> = {}): ProjectFormValues {
  return { ...emptyForm(), ...overrides };
}

describe('formToTile', () => {
  it('разрешает id технологий и коллабораторов в названия активной локали', () => {
    const tile = formToTile(
      form({ technologyIds: ['t2', 't1'], contributorIds: ['c1'] }),
      technologies,
      contributors,
      'ru',
      FALLBACKS,
    );

    expect(tile.technologies).toEqual(['NestJS', 'React']);
    expect(tile.contributors).toEqual([{ name: 'Богдан Сутужко', image: null, color: '#238636' }]);
  });

  it('берёт имя коллаборатора из активной локали', () => {
    const tile = formToTile(
      form({ contributorIds: ['c1'] }),
      technologies,
      contributors,
      'en',
      FALLBACKS,
    );

    expect(tile.contributors[0]?.name).toBe('Bogdan Sutuzhko');
  });

  it('игнорирует id, которых нет в каталоге', () => {
    const tile = formToTile(
      form({ technologyIds: ['t1', 'ghost'], contributorIds: ['ghost'] }),
      technologies,
      contributors,
      'ru',
      FALLBACKS,
    );

    expect(tile.technologies).toEqual(['React']);
    expect(tile.contributors).toEqual([]);
  });

  it('подставляет заглушки, пока название и описание пусты', () => {
    const tile = formToTile(form(), technologies, contributors, 'ru', FALLBACKS);

    expect(tile.title).toBe(FALLBACKS.title);
    expect(tile.description).toBe(FALLBACKS.description);
  });

  it('пустые необязательные поля превращает в null, а не в пустую строку', () => {
    const tile = formToTile(
      form({ category: '  ', period: '', runCommand: '  ' }),
      technologies,
      contributors,
      'ru',
      FALLBACKS,
    );

    expect(tile.category).toBeNull();
    expect(tile.period).toBeNull();
    expect(tile.runCommand).toBeNull();
  });

  it('переносит маркер запуска, когда проект запускаемый', () => {
    const tile = formToTile(
      form({ runnable: true, runCommand: 'run 2048', period: '2025', category: 'side-project' }),
      technologies,
      contributors,
      'ru',
      FALLBACKS,
    );

    expect(tile.runnable).toBe(true);
    expect(tile.runCommand).toBe('run 2048');
    expect(tile.period).toBe('2025');
    expect(tile.category).toBe('side-project');
  });
});

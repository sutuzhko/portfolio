import { describe, expect, it } from 'vitest';

import type { ContributorAdmin } from '@/entities/contributor';

import { initStaged, stageCreate, stageUpdate, stagedToUpdateBody } from './contributor-staging';

const existing: ContributorAdmin = {
  id: 'c1',
  name: { ru: 'Пётр', en: null },
  image: null,
  color: '#238636',
  link: null,
  order: 0,
};

describe('contributor-staging — цвет аватара', () => {
  it('stageCreate с пустым цветом даёт color = null', () => {
    const list = stageCreate([], { name: 'Аня', color: '', image: '', link: '' }, 'ru');
    expect(list[0]?.color).toBeNull();
  });

  it('stageUpdate очищает цвет (пустая строка → null)', () => {
    const list = stageUpdate(
      initStaged([existing]),
      'c1',
      { name: 'Пётр', color: '', image: '', link: '' },
      'ru',
    );
    expect(list[0]?.color).toBeNull();
  });

  it('stagedToUpdateBody шлёт пустую строку для сброшенного цвета (не undefined)', () => {
    const cleared = { ...existing, color: null, isNew: false, isDeleted: false, isEdited: true };
    expect(stagedToUpdateBody(cleared).color).toBe('');
  });

  it('stagedToUpdateBody сохраняет заданный цвет', () => {
    const kept = { ...existing, isNew: false, isDeleted: false, isEdited: true };
    expect(stagedToUpdateBody(kept).color).toBe('#238636');
  });
});

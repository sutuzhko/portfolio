import { describe, expect, it } from 'vitest';

import type { ContributorAdmin } from '@/entities/contributor';

import {
  initStaged,
  planContributorStaging,
  stageCreate,
  stageDelete,
  stageReorder,
  stageUpdate,
  stagedToCreateBody,
  stagedToUpdateBody,
} from './contributor-staging';

const existing: ContributorAdmin = {
  id: 'c1',
  name: { ru: 'Пётр', en: null },
  image: null,
  color: '#238636',
  link: null,
  order: 0,
};

const catalog: ContributorAdmin[] = [
  { ...existing, id: 'a', name: { ru: 'Аня', en: null }, order: 0 },
  { ...existing, id: 'b', name: { ru: 'Борис', en: null }, order: 1 },
  { ...existing, id: 'c', name: { ru: 'Вера', en: null }, order: 2 },
];

const noDraft = { color: '', image: '', link: '' };

describe('contributor-staging — цвет аватара', () => {
  it('stageCreate с пустым цветом даёт color = null', () => {
    const list = stageCreate([], { name: 'Аня', ...noDraft }, 'ru');
    expect(list[0]?.color).toBeNull();
  });

  it('stageUpdate очищает цвет (пустая строка → null)', () => {
    const list = stageUpdate(initStaged([existing]), 'c1', { name: 'Пётр', ...noDraft }, 'ru');
    expect(list[0]?.color).toBeNull();
  });

  it('stagedToUpdateBody шлёт пустую строку для сброшенного цвета (не undefined)', () => {
    const cleared = { ...existing, color: null, isNew: false, isDeleted: false, isEdited: true };
    expect(stagedToUpdateBody({ entry: cleared, order: cleared.order }).color).toBe('');
  });

  it('stagedToUpdateBody сохраняет заданный цвет', () => {
    const kept = { ...existing, isNew: false, isDeleted: false, isEdited: true };
    expect(stagedToUpdateBody({ entry: kept, order: kept.order }).color).toBe('#238636');
  });
});

describe('contributor-staging — порядок (drag&drop)', () => {
  it('stageReorder ставит участника на место другого', () => {
    const ids = stageReorder(initStaged(catalog), 'c', 'a').map((entry) => entry.id);
    expect(ids).toEqual(['c', 'a', 'b']);
  });

  it('без правок и перестановок план пуст', () => {
    const plan = planContributorStaging(initStaged(catalog));
    expect([...plan.creates, ...plan.updates, ...plan.deletes]).toEqual([]);
  });

  it('перенос одного участника — один PATCH только с новым order', () => {
    const plan = planContributorStaging(stageReorder(initStaged(catalog), 'c', 'a'));
    expect(plan.updates.map((planned) => planned.entry.id)).toEqual(['c']);
    expect(plan.updates.map(stagedToUpdateBody)).toEqual([{ order: -1 }]);
  });

  it('правка полей вместе с переносом — полное тело и новый order', () => {
    const edited = stageUpdate(initStaged(catalog), 'c', { name: 'Вера П.', ...noDraft }, 'ru');
    const [body] = planContributorStaging(stageReorder(edited, 'c', 'a')).updates.map(
      stagedToUpdateBody,
    );
    expect(body).toMatchObject({ name: { ru: 'Вера П.' }, order: -1 });
  });

  it('новый участник в конце получает следующую позицию', () => {
    const list = stageCreate(initStaged(catalog), { name: 'Гоша', ...noDraft }, 'ru');
    const plan = planContributorStaging(list);
    expect(plan.creates.map(stagedToCreateBody)).toEqual([expect.objectContaining({ order: 3 })]);
  });

  it('удаление не перенумеровывает соседей', () => {
    const plan = planContributorStaging(stageDelete(initStaged(catalog), 'b'));
    expect(plan.updates).toEqual([]);
    expect(plan.deletes.map((entry) => entry.id)).toEqual(['b']);
  });
});

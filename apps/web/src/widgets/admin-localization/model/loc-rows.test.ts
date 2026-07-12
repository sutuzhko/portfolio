import { describe, expect, it } from 'vitest';

import {
  changedRows,
  computeStats,
  effective,
  filterRows,
  isChanged,
  type LocEdits,
  type LocRow,
} from './loc-rows';

const row = (id: string, ru: string, en: string): LocRow => ({
  id,
  sectionId: 'projects',
  sectionLabel: 'Проекты',
  sourceId: 'project',
  entityId: id,
  fieldKey: 'title',
  label: `Проект ${id}`,
  ru,
  en,
});

// r1 переведён, r2 без EN, r3 EN == RU (не переведён по сути). Именованные
// константы, а не индексация массива — иначе `noUncheckedIndexedAccess` требует
// ассерта, который eslint считает лишним (разные tsconfig у сборки и линтера).
const r1 = row('r1', 'Привет', 'Hello');
const r2 = row('r2', 'Пока', '');
const r3 = row('r3', 'Стек', 'Стек');
const rows: LocRow[] = [r1, r2, r3];

describe('loc-rows: значения и флаги', () => {
  it('effective подставляет правку, иначе исходное', () => {
    const edits: LocEdits = { r2: { ru: 'Пока', en: 'Bye' } };
    expect(effective(r2, edits)).toEqual({ ru: 'Пока', en: 'Bye' });
    expect(effective(r1, {})).toEqual({ ru: 'Привет', en: 'Hello' });
  });

  it('isChanged = есть правка с иным значением', () => {
    expect(isChanged(r2, { r2: { ru: 'Пока', en: 'Bye' } })).toBe(true);
    expect(isChanged(r2, { r2: { ru: 'Пока', en: '' } })).toBe(false);
  });
});

describe('loc-rows: статистика', () => {
  it('считает покрытие, отсутствие EN и совпадение с RU', () => {
    const stats = computeStats(rows, {});
    expect(stats).toMatchObject({ total: 3, translated: 1, missingEn: 1, sameAsRu: 1 });
    expect(stats.coverage).toBe(33);
  });

  it('правка EN повышает покрытие', () => {
    const stats = computeStats(rows, { r2: { ru: 'Пока', en: 'Bye' } });
    expect(stats).toMatchObject({ translated: 2, missingEn: 0 });
    expect(stats.coverage).toBe(67);
  });
});

describe('loc-rows: фильтр и стек изменений', () => {
  it('«Проблемы» = нет EN + совпадает с RU', () => {
    expect(filterRows(rows, {}, 'problems', '').map((r) => r.id)).toEqual(['r2', 'r3']);
  });

  it('«Изменённые» показывает только строки из диффа', () => {
    const edits: LocEdits = { r2: { ru: 'Пока', en: 'Bye' } };
    expect(filterRows(rows, edits, 'changed', '').map((r) => r.id)).toEqual(['r2']);
    expect(changedRows(rows, edits).map((r) => r.id)).toEqual(['r2']);
  });

  it('поиск матчит по ключу/ru/en с учётом правок', () => {
    expect(
      filterRows(rows, { r2: { ru: 'Пока', en: 'Bye' } }, 'all', 'bye').map((r) => r.id),
    ).toEqual(['r2']);
    expect(filterRows(rows, {}, 'all', 'hello').map((r) => r.id)).toEqual(['r1']);
  });
});

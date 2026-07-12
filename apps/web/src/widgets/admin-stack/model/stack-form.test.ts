import { describe, expect, it } from 'vitest';

import {
  countStackChanges,
  planSkillOrders,
  planTechOrders,
  type LangRow,
  type SkillChip,
  type TechCategory,
  type TechChip,
} from './stack-form';

const categories: TechCategory[] = [{ key: 'c1', name: 'Frontend' }];
const chips: TechChip[] = [
  { key: 'r', id: 'r', name: 'React', categoryKey: 'c1', order: 0 },
  { key: 'v', id: 'v', name: 'Vue', categoryKey: 'c1', order: 1 },
  { key: 'n', id: 'n', name: 'Next', categoryKey: 'c1', order: 2 },
];

const baseArgs = {
  initialCategories: categories,
  initialChips: chips,
  initialLangRows: [] as LangRow[],
  initialSkillChips: [] as SkillChip[],
  categories,
  chips,
  langRows: [] as LangRow[],
  skillChips: [] as SkillChip[],
  deletedTechIds: [] as string[],
  deletedLangIds: [] as string[],
  deletedSkillIds: [] as string[],
};

describe('planTechOrders', () => {
  it('удаление не перенумеровывает соседей — их order сохраняется', () => {
    // React удалён: оставшиеся Vue(1)/Next(2) идут по возрастанию — план их не трогает.
    const plan = planTechOrders(categories, [chips[1], chips[2]]);
    expect(plan.get('v')).toBe(1);
    expect(plan.get('n')).toBe(2);
  });

  it('перенос React в конец бампит только его', () => {
    const reordered = [chips[1], chips[2], chips[0]];
    const plan = planTechOrders(categories, reordered);
    expect(plan.get('v')).toBe(1);
    expect(plan.get('n')).toBe(2);
    expect(plan.get('r')).toBe(3);
  });

  it('перенос последнего чипа в начало меняет порядок ТОЛЬКО у него (без каскада)', () => {
    // React(0)/Vue(1)/Next(2) → Next в начало: [Next(2), React(0), Vue(1)].
    const moved = [chips[2], chips[0], chips[1]];
    const plan = planTechOrders(categories, moved);
    // Якоря React/Vue сохраняют свой order; сдвинулся только Next (получил дробную позицию < 0).
    expect(plan.get('r')).toBe(0);
    expect(plan.get('v')).toBe(1);
    expect(plan.get('n')).toBeLessThan(0);
    // Ровно один чип поменял order → один PATCH, а не перенумерация всех.
    const changed = [chips[2], chips[0], chips[1]].filter((c) => plan.get(c.key) !== c.order);
    expect(changed).toHaveLength(1);
  });

  it('новый чип получает следующий свободный номер', () => {
    const withNew: TechChip[] = [
      ...chips,
      { key: 'new', id: null, name: 'Svelte', categoryKey: 'c1', order: 0 },
    ];
    expect(planTechOrders(categories, withNew).get('new')).toBe(3);
  });
});

describe('countStackChanges', () => {
  it('нет правок — ноль', () => {
    expect(countStackChanges(baseArgs)).toBe(0);
  });

  it('удаление одного чипа = 1 (а не перенумерация всех)', () => {
    expect(
      countStackChanges({
        ...baseArgs,
        chips: [chips[1], chips[2]],
        deletedTechIds: ['r'],
      }),
    ).toBe(1);
  });

  it('перенос одного чипа считается как 1', () => {
    expect(countStackChanges({ ...baseArgs, chips: [chips[1], chips[2], chips[0]] })).toBe(1);
  });

  it('смена категории (переименование блока) считается по каждому чипу', () => {
    const renamed: TechCategory[] = [{ key: 'c1', name: 'UI' }];
    expect(
      countStackChanges({ ...baseArgs, categories: renamed, initialCategories: categories }),
    ).toBe(3);
  });
});

describe('planSkillOrders', () => {
  it('удаление навыка не трогает порядок остальных', () => {
    const skills: SkillChip[] = [
      { key: 'a', id: 'a', name: 'A', order: 0 },
      { key: 'b', id: 'b', name: 'B', order: 1 },
    ];
    const plan = planSkillOrders([skills[1]]);
    expect(plan.get('b')).toBe(1);
  });
});

import { describe, expect, it } from 'vitest';

import type { TechnologyAdmin } from '@/entities/technology';

import {
  countTechnologyChanges,
  initTechStaged,
  isTempTechnologyId,
  planTechnologyStaging,
  stageCreateTech,
  stageDeleteTech,
  stageUpdateTech,
  stagedToTechCatalog,
  stagedToTechCreateBody,
} from './technology-staging';

const catalog: TechnologyAdmin[] = [
  { id: 't1', name: 'React', category: 'frontend', order: 0 },
  { id: 't2', name: 'NestJS', category: 'backend', order: 1 },
];

describe('technology-staging', () => {
  it('stageCreateTech добавляет запись с временным id и категорией', () => {
    const list = stageCreateTech(initTechStaged(catalog), { name: 'Vite', category: 'tooling' });
    const added = list[list.length - 1];
    expect(added?.name).toBe('Vite');
    expect(added?.category).toBe('tooling');
    expect(isTempTechnologyId(added?.id ?? '')).toBe(true);
    expect(planTechnologyStaging(list).creates).toHaveLength(1);
  });

  it('пустая категория сохраняется как null', () => {
    const list = stageCreateTech([], { name: 'Vite', category: '' });
    expect(list[0]?.category).toBeNull();
  });

  it('stageUpdateTech помечает существующую изменённой', () => {
    const list = stageUpdateTech(initTechStaged(catalog), 't1', {
      name: 'React 19',
      category: 'frontend',
    });
    expect(list[0]?.name).toBe('React 19');
    expect(planTechnologyStaging(list).updates).toHaveLength(1);
  });

  it('stageDeleteTech: существующую помечает, новую выбрасывает', () => {
    const withNew = stageCreateTech(initTechStaged(catalog), { name: 'Vite', category: '' });
    const tempId = withNew[withNew.length - 1]?.id ?? '';
    // удаление новой — исчезает совсем
    expect(stageDeleteTech(withNew, tempId)).toHaveLength(catalog.length);
    // удаление существующей — помечается на удаление
    const afterDelete = stageDeleteTech(initTechStaged(catalog), 't1');
    expect(planTechnologyStaging(afterDelete).deletes).toHaveLength(1);
    expect(stagedToTechCatalog(afterDelete)).toHaveLength(catalog.length - 1);
  });

  it('countTechnologyChanges суммирует создания/правки/удаления', () => {
    let list = stageCreateTech(initTechStaged(catalog), { name: 'Vite', category: '' });
    list = stageUpdateTech(list, 't1', { name: 'React 19', category: 'frontend' });
    list = stageDeleteTech(list, 't2');
    expect(countTechnologyChanges(list)).toBe(3);
  });

  it('stagedToTechCreateBody опускает пустую категорию', () => {
    const body = stagedToTechCreateBody({
      id: 'x',
      name: 'Vite',
      category: null,
      order: 0,
      isNew: true,
      isDeleted: false,
      isEdited: false,
    });
    expect(body).toEqual({ name: 'Vite', category: undefined });
  });
});

import type { CreateTechnology, TechnologyAdmin, UpdateTechnology } from '@/entities/technology';

/**
 * Черновик каталожной записи технологии. Весь CRUD (создание/правка/удаление)
 * копится локально и применяется одним пакетом на «Сохранить» проекта — как у
 * участников ([[contributor-staging]]). Имя технологии — простая строка (не
 * локализуется), плюс необязательная категория.
 */
export interface StagedTechnology extends TechnologyAdmin {
  readonly isNew: boolean;
  readonly isDeleted: boolean;
  readonly isEdited: boolean;
}

/** Строки формы технологии (имя обязателен, категория — нет). */
export interface TechnologyDraft {
  readonly name: string;
  readonly category: string;
}

const TEMP_PREFIX = 'tmp-technology-';

/** Временный ли это id (несохранённая технология). */
export function isTempTechnologyId(id: string): boolean {
  return id.startsWith(TEMP_PREFIX);
}

function makeTempId(list: readonly StagedTechnology[]): string {
  let index = list.length + 1;
  while (list.some((entry) => entry.id === `${TEMP_PREFIX}${index}`)) index += 1;
  return `${TEMP_PREFIX}${index}`;
}

/** Инициализирует черновик из каталога: все записи существующие, без изменений. */
export function initTechStaged(technologies: readonly TechnologyAdmin[]): StagedTechnology[] {
  return technologies.map((technology) => ({
    ...technology,
    isNew: false,
    isDeleted: false,
    isEdited: false,
  }));
}

/** Добавляет новую технологию (временный id) в конец списка. */
export function stageCreateTech(
  list: readonly StagedTechnology[],
  draft: TechnologyDraft,
): StagedTechnology[] {
  const entry: StagedTechnology = {
    id: makeTempId(list),
    name: draft.name,
    category: draft.category || null,
    order: list.length,
    isNew: true,
    isDeleted: false,
    isEdited: false,
  };
  return [...list, entry];
}

/** Правит существующую/новую технологию; существующая помечается изменённой. */
export function stageUpdateTech(
  list: readonly StagedTechnology[],
  id: string,
  draft: TechnologyDraft,
): StagedTechnology[] {
  return list.map((entry) =>
    entry.id === id
      ? {
          ...entry,
          name: draft.name,
          category: draft.category || null,
          isEdited: entry.isNew ? false : true,
        }
      : entry,
  );
}

/** Помечает существующую на удаление; новую — выбрасывает совсем. */
export function stageDeleteTech(list: readonly StagedTechnology[], id: string): StagedTechnology[] {
  return list.flatMap((entry) => {
    if (entry.id !== id) return [entry];
    return entry.isNew ? [] : [{ ...entry, isDeleted: true }];
  });
}

/** Видимые записи (без помеченных на удаление) — для чипов и предпросмотра. */
export function visibleTechStaged(list: readonly StagedTechnology[]): StagedTechnology[] {
  return list.filter((entry) => !entry.isDeleted);
}

/** Каталог-форма для `formToTile`/мультиселекта: без флагов и удалённых. */
export function stagedToTechCatalog(list: readonly StagedTechnology[]): TechnologyAdmin[] {
  return visibleTechStaged(list).map(({ isNew: _n, isDeleted: _d, isEdited: _e, ...rest }) => rest);
}

/** План применения черновика к API. */
export interface TechnologyStagingPlan {
  readonly creates: readonly StagedTechnology[];
  readonly updates: readonly StagedTechnology[];
  readonly deletes: readonly StagedTechnology[];
}

/** Раскладывает черновик на операции create/update/delete. */
export function planTechnologyStaging(list: readonly StagedTechnology[]): TechnologyStagingPlan {
  return {
    creates: list.filter((entry) => entry.isNew && !entry.isDeleted),
    updates: list.filter((entry) => entry.isEdited && !entry.isNew && !entry.isDeleted),
    deletes: list.filter((entry) => entry.isDeleted && !entry.isNew),
  };
}

/** Есть ли что применять (для гейта «Сохранить» и счётчика диффа). */
export function countTechnologyChanges(list: readonly StagedTechnology[]): number {
  const plan = planTechnologyStaging(list);
  return plan.creates.length + plan.updates.length + plan.deletes.length;
}

/** Тело create для записи черновика. */
export function stagedToTechCreateBody(entry: StagedTechnology): CreateTechnology {
  return { name: entry.name, category: entry.category ?? undefined };
}

/** Тело update для записи черновика. */
export function stagedToTechUpdateBody(entry: StagedTechnology): UpdateTechnology {
  return { name: entry.name, category: entry.category ?? undefined };
}

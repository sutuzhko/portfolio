import type {
  ContributorAdmin,
  CreateContributor,
  UpdateContributor,
} from '@/entities/contributor';
import type { AppLanguage } from '@/shared/config';

import type { ContributorDraft } from '../ui/contributor-form';

/**
 * Черновик каталожной записи участника. Весь CRUD (создание/правка/удаление)
 * копится локально и применяется одним пакетом на «Сохранить» проекта — до этого
 * изменения обратимы «Отменой». Запись = каталожная (`ContributorAdmin`) плюс
 * флаги стадии.
 */
export interface StagedContributor extends ContributorAdmin {
  /** Создан локально — реальный id придёт с бэка после применения. */
  readonly isNew: boolean;
  /** Помечен на удаление: существующий → DELETE, новый → просто выбрасывается. */
  readonly isDeleted: boolean;
  /** Существующий, изменённый относительно исходного → PATCH. */
  readonly isEdited: boolean;
}

const TEMP_PREFIX = 'tmp-contributor-';

/** Временный ли это id (несохранённый участник). */
export function isTempContributorId(id: string): boolean {
  return id.startsWith(TEMP_PREFIX);
}

/** Уникальный временный id, детерминированно выбранный по текущему списку. */
function makeTempId(list: readonly StagedContributor[]): string {
  let index = list.length + 1;
  while (list.some((entry) => entry.id === `${TEMP_PREFIX}${index}`)) index += 1;
  return `${TEMP_PREFIX}${index}`;
}

/** Инициализирует черновик из каталога: все записи существующие, без изменений. */
export function initStaged(contributors: readonly ContributorAdmin[]): StagedContributor[] {
  return contributors.map((contributor) => ({
    ...contributor,
    isNew: false,
    isDeleted: false,
    isEdited: false,
  }));
}

/** Правит активную локаль имени, сохраняя вторую (перевод не теряется). */
function applyName(
  name: ContributorAdmin['name'],
  locale: AppLanguage,
  value: string,
): ContributorAdmin['name'] {
  return locale === 'ru' ? { ...name, ru: value } : { ru: name.ru, en: value };
}

/** Добавляет нового участника (временный id) в конец списка. */
export function stageCreate(
  list: readonly StagedContributor[],
  draft: ContributorDraft,
  locale: AppLanguage,
): StagedContributor[] {
  // ru обязателен на бэке: при вводе в EN дублируем значение в ru.
  const name: ContributorAdmin['name'] =
    locale === 'ru' ? { ru: draft.name, en: null } : { ru: draft.name, en: draft.name };
  const entry: StagedContributor = {
    id: makeTempId(list),
    name,
    image: null,
    color: draft.color,
    link: draft.link || null,
    order: list.length,
    isNew: true,
    isDeleted: false,
    isEdited: false,
  };
  return [...list, entry];
}

/** Правит существующего/нового участника; существующий помечается изменённым. */
export function stageUpdate(
  list: readonly StagedContributor[],
  id: string,
  draft: ContributorDraft,
  locale: AppLanguage,
): StagedContributor[] {
  return list.map((entry) =>
    entry.id === id
      ? {
          ...entry,
          name: applyName(entry.name, locale, draft.name),
          color: draft.color,
          link: draft.link || null,
          isEdited: entry.isNew ? false : true,
        }
      : entry,
  );
}

/** Помечает существующего на удаление; нового — выбрасывает совсем. */
export function stageDelete(list: readonly StagedContributor[], id: string): StagedContributor[] {
  return list.flatMap((entry) => {
    if (entry.id !== id) return [entry];
    return entry.isNew ? [] : [{ ...entry, isDeleted: true }];
  });
}

/** Видимые записи (без помеченных на удаление) — для чипов и предпросмотра плитки. */
export function visibleStaged(list: readonly StagedContributor[]): StagedContributor[] {
  return list.filter((entry) => !entry.isDeleted);
}

/** Каталог-форма для `formToTile`/мультиселекта: без флагов и удалённых. */
export function stagedToCatalog(list: readonly StagedContributor[]): ContributorAdmin[] {
  return visibleStaged(list).map(({ isNew: _n, isDeleted: _d, isEdited: _e, ...rest }) => rest);
}

/** План применения черновика к API. */
export interface ContributorStagingPlan {
  readonly creates: readonly StagedContributor[];
  readonly updates: readonly StagedContributor[];
  readonly deletes: readonly StagedContributor[];
}

/** Раскладывает черновик на операции create/update/delete. */
export function planContributorStaging(list: readonly StagedContributor[]): ContributorStagingPlan {
  return {
    creates: list.filter((entry) => entry.isNew && !entry.isDeleted),
    updates: list.filter((entry) => entry.isEdited && !entry.isNew && !entry.isDeleted),
    deletes: list.filter((entry) => entry.isDeleted && !entry.isNew),
  };
}

/** Есть ли что применять (для гейта «Сохранить» и счётчика диффа). */
export function countContributorChanges(list: readonly StagedContributor[]): number {
  const plan = planContributorStaging(list);
  return plan.creates.length + plan.updates.length + plan.deletes.length;
}

/** Имя записи → тело запроса (en опускается, если пуст). */
function toNameInput(name: ContributorAdmin['name']): CreateContributor['name'] {
  return name.en ? { ru: name.ru, en: name.en } : { ru: name.ru };
}

/** Тело create для записи черновика. */
export function stagedToCreateBody(entry: StagedContributor): CreateContributor {
  return {
    name: toNameInput(entry.name),
    color: entry.color ?? undefined,
    link: entry.link ?? undefined,
  };
}

/** Тело update для записи черновика. */
export function stagedToUpdateBody(entry: StagedContributor): UpdateContributor {
  return {
    name: toNameInput(entry.name),
    color: entry.color ?? undefined,
    link: entry.link ?? undefined,
  };
}

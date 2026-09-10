import type {
  ContributorAdmin,
  CreateContributor,
  UpdateContributor,
} from '@/entities/contributor';
import type { AppLanguage } from '@/shared/config';
import { planMinimalOrders } from '@/shared/lib';

import type { ContributorDraft } from '../ui/contributor-form';

/**
 * Черновик каталожной записи участника. Весь CRUD (создание/правка/удаление) и
 * перестановка копятся локально и применяются одним пакетом на «Сохранить» проекта —
 * до этого изменения обратимы «Отменой». Запись = каталожная (`ContributorAdmin`)
 * плюс флаги стадии; порядок черновика = желаемый порядок каталога.
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
    image: draft.image || null,
    color: draft.color || null,
    link: draft.link || null,
    // Позицию нового участника назначит план на сохранении (между соседями).
    order: 0,
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
          color: draft.color || null,
          image: draft.image || null,
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

/**
 * Перетаскивание: участник `activeId` встаёт на место `overId`. Меняется только
 * последовательность черновика — новые `order` посчитает план на сохранении.
 */
export function stageReorder(
  list: readonly StagedContributor[],
  activeId: string,
  overId: string,
): StagedContributor[] {
  const from = list.findIndex((entry) => entry.id === activeId);
  const to = list.findIndex((entry) => entry.id === overId);
  const next = [...list];
  if (from === -1 || to === -1 || from === to) return next;
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/** Видимые записи (без помеченных на удаление) — для чипов и предпросмотра плитки. */
export function visibleStaged(list: readonly StagedContributor[]): StagedContributor[] {
  return list.filter((entry) => !entry.isDeleted);
}

/** Каталог-форма для `formToTile`/мультиселекта: без флагов и удалённых. */
export function stagedToCatalog(list: readonly StagedContributor[]): ContributorAdmin[] {
  return visibleStaged(list).map(({ isNew: _n, isDeleted: _d, isEdited: _e, ...rest }) => rest);
}

/** Запись плана вместе с целевой позицией в каталоге. */
export interface PlannedContributor {
  readonly entry: StagedContributor;
  readonly order: number;
}

/** План применения черновика к API. */
export interface ContributorStagingPlan {
  readonly creates: readonly PlannedContributor[];
  /** Существующие с правкой полей и/или сдвинутые перетаскиванием. */
  readonly updates: readonly PlannedContributor[];
  readonly deletes: readonly StagedContributor[];
}

/**
 * Раскладывает черновик на операции create/update/delete. Позиции — минимальным
 * диффом по видимой последовательности (как у технологий): сохранённые участники,
 * чей порядок не нарушен, остаются якорями, а сдвинутые и новые встают дробной
 * позицией между соседями — перенос одного участника = один PATCH.
 */
export function planContributorStaging(list: readonly StagedContributor[]): ContributorStagingPlan {
  const visible = visibleStaged(list);
  const orders = planMinimalOrders(
    visible.map((entry) => ({
      key: entry.id,
      id: entry.isNew ? null : entry.id,
      order: entry.order,
    })),
  );
  const planned = visible.map((entry) => ({ entry, order: orders.get(entry.id) ?? entry.order }));
  return {
    creates: planned.filter(({ entry }) => entry.isNew),
    updates: planned.filter(
      ({ entry, order }) => !entry.isNew && (entry.isEdited || order !== entry.order),
    ),
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

/** Тело create для записи плана (с позицией в каталоге). */
export function stagedToCreateBody({ entry, order }: PlannedContributor): CreateContributor {
  return {
    name: toNameInput(entry.name),
    color: entry.color ?? undefined,
    image: entry.image ?? undefined,
    link: entry.link ?? undefined,
    order,
  };
}

/**
 * Тело update: правка полей шлёт их целиком, перетаскивание — только новый `order`
 * (PATCH лишь того, что изменилось).
 */
export function stagedToUpdateBody({ entry, order }: PlannedContributor): UpdateContributor {
  const orderPatch = order === entry.order ? {} : { order };
  if (!entry.isEdited) return orderPatch;
  return {
    name: toNameInput(entry.name),
    // Сброшенный цвет шлём пустой строкой (бэк маппит в null) — undefined бы «не менять».
    color: entry.color ?? '',
    image: entry.image ?? undefined,
    link: entry.link ?? undefined,
    ...orderPatch,
  };
}

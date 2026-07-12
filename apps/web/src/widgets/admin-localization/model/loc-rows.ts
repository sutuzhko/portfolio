/**
 * Модель вкладки «Локализация»: плоские строки локализуемых полей со всех сущностей
 * и чистая логика над ними (правки-дифф, флаги, статистика, фильтр). Загрузка и
 * фан-аут PATCH-ей — в реестре источников и контейнере; здесь ничего про сеть.
 */

/** Источник строки в реестре — адрес для фан-аута PATCH. */
export type LocSourceId = 'profile' | 'project' | 'experience' | 'education';

/** Строка таблицы: одно локализуемое поле конкретной сущности. */
export interface LocRow {
  /** Уникальный id строки: `${sourceId}:${entityId}:${fieldKey}`. */
  readonly id: string;
  /** Секция (тип сущности) — для группировки в таблице. */
  readonly sectionId: string;
  readonly sectionLabel: string;
  /** Источник в реестре + id сущности + поле — адрес для фан-аута PATCH. */
  readonly sourceId: LocSourceId;
  readonly entityId: string;
  readonly fieldKey: string;
  /** Человекочитаемый ключ строки (напр. «Procharity · Заголовок»). */
  readonly label: string;
  /** Исходные значения с сервера. */
  readonly ru: string;
  readonly en: string;
}

/** Накопленные правки по id строки (значения ячеек после редактирования). */
export type LocEdits = Readonly<Record<string, { readonly ru: string; readonly en: string }>>;

/** Значения строки с учётом правок (или исходные, если правок нет). */
export function effective(row: LocRow, edits: LocEdits): { ru: string; en: string } {
  const edit = edits[row.id];
  return edit ? { ru: edit.ru, en: edit.en } : { ru: row.ru, en: row.en };
}

/** Строка изменена относительно сервера (есть правка с другим значением). */
export function isChanged(row: LocRow, edits: LocEdits): boolean {
  const edit = edits[row.id];
  return edit !== undefined && (edit.ru !== row.ru || edit.en !== row.en);
}

/** Нет перевода EN (пустой). */
export function isMissingEn(value: { en: string }): boolean {
  return value.en.trim() === '';
}

/** EN совпадает с RU (перевод не сделан, а просто скопирован). */
export function isSameAsRu(value: { ru: string; en: string }): boolean {
  return value.en.trim() !== '' && value.en.trim() === value.ru.trim();
}

export interface LocStats {
  readonly total: number;
  readonly translated: number;
  readonly missingEn: number;
  readonly sameAsRu: number;
  /** Доля переведённых, 0..100 (целое). */
  readonly coverage: number;
}

/** Сводная статистика по строкам с учётом правок. */
export function computeStats(rows: readonly LocRow[], edits: LocEdits): LocStats {
  let missingEn = 0;
  let sameAsRu = 0;
  for (const row of rows) {
    const value = effective(row, edits);
    if (isMissingEn(value)) missingEn += 1;
    else if (isSameAsRu(value)) sameAsRu += 1;
  }
  const total = rows.length;
  const translated = total - missingEn - sameAsRu;
  const coverage = total === 0 ? 100 : Math.round((translated / total) * 100);
  return { total, translated, missingEn, sameAsRu, coverage };
}

export type LocFilter = 'all' | 'problems' | 'missing' | 'sameRu' | 'changed';

/** Фильтрация строк по вкладке-фильтру и поисковому запросу (ключ/ru/en). */
export function filterRows(
  rows: readonly LocRow[],
  edits: LocEdits,
  filter: LocFilter,
  query: string,
): LocRow[] {
  const needle = query.trim().toLowerCase();
  return rows.filter((row) => {
    const value = effective(row, edits);
    const matchesFilter =
      filter === 'all' ||
      (filter === 'missing' && isMissingEn(value)) ||
      (filter === 'sameRu' && isSameAsRu(value)) ||
      (filter === 'problems' && (isMissingEn(value) || isSameAsRu(value))) ||
      (filter === 'changed' && isChanged(row, edits));
    if (!matchesFilter) return false;
    if (needle === '') return true;
    return (
      row.label.toLowerCase().includes(needle) ||
      value.ru.toLowerCase().includes(needle) ||
      value.en.toLowerCase().includes(needle)
    );
  });
}

/** Только реально изменённые строки — исходный «стек» для сохранения. */
export function changedRows(rows: readonly LocRow[], edits: LocEdits): LocRow[] {
  return rows.filter((row) => isChanged(row, edits));
}

/** Секция таблицы: строки одной сущности под общим заголовком. */
export interface LocGroup {
  readonly id: string;
  readonly label: string;
  readonly rows: readonly LocRow[];
}

/** Группирует строки по секции, сохраняя порядок первого появления. */
export function groupRows(rows: readonly LocRow[]): LocGroup[] {
  const order: string[] = [];
  const map = new Map<string, LocRow[]>();
  for (const row of rows) {
    const bucket = map.get(row.sectionId);
    if (bucket) {
      bucket.push(row);
    } else {
      order.push(row.sectionId);
      map.set(row.sectionId, [row]);
    }
  }
  return order.map((id) => {
    const groupRowsList = map.get(id) ?? [];
    return { id, label: groupRowsList[0]?.sectionLabel ?? '', rows: groupRowsList };
  });
}

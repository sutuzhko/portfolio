import type {
  CreateLanguage,
  LanguageAdmin,
  LocalizedText,
  UpdateLanguage,
} from '@/entities/language';
import type { CreateSkill, SkillAdmin } from '@/entities/skill';
import type { CreateTechnology, TechnologyAdmin } from '@/entities/technology';
import type { AppLanguage } from '@/shared/config';

/**
 * Модель вкладки «Стек и языки»: технологии — чипы, сгруппированные по редактируемым
 * категориям; языки — строки; навыки — плоские чипы. Всё правится в локальном
 * состоянии и уходит одним пакетом по «Сохранить» (контейнер считает разницу).
 */

let counter = 0;
function nextKey(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

/* ---------- Технологии (чипы по редактируемым категориям) ---------- */

/**
 * Категория технологий. Отдельной сущности на бэке нет — категория живёт как поле
 * `category` на каждой технологии, поэтому у неё локальный `key` (переименование
 * не ломает связь чипов) и `name` (правится инлайн).
 */
export interface TechCategory {
  readonly key: string;
  readonly name: string;
}

/**
 * Чип технологии; `id: null` — ещё не сохранённая. `categoryKey` — ссылка на локальную
 * категорию. `order` — сохранённая позиция с бэка (у новых — 0, назначится при сохранении):
 * по ней считаем минимальный дифф порядка, чтобы правка одного чипа не перенумеровывала все.
 */
export interface TechChip {
  readonly key: string;
  readonly id: string | null;
  readonly name: string;
  readonly categoryKey: string;
  readonly order: number;
}

/** Категории по порядку первого появления (с локальными ключами). */
export function buildTechCategories(items: readonly TechnologyAdmin[]): TechCategory[] {
  const order: TechCategory[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const category = item.category ?? '';
    if (category !== '' && !seen.has(category)) {
      seen.add(category);
      order.push({ key: nextKey('cat'), name: category });
    }
  }
  return order;
}

/** Админ-технологии → чипы, привязанные к категориям по имени. */
export function buildTechChips(
  items: readonly TechnologyAdmin[],
  categories: readonly TechCategory[],
): TechChip[] {
  const keyByName = new Map(categories.map((category) => [category.name, category.key]));
  return items.map((item) => ({
    key: item.id,
    id: item.id,
    name: item.name,
    categoryKey: keyByName.get(item.category ?? '') ?? '',
    order: item.order,
  }));
}

/** Новая (локальная) категория; по умолчанию без имени — правится инлайн сразу. */
export function newTechCategory(name = ''): TechCategory {
  return { key: nextKey('new-cat'), name };
}

/** Новый пустой чип в категории — заполняется инлайн (order назначится на сохранении). */
export function newTechChip(categoryKey: string): TechChip {
  return { key: nextKey('new-tech'), id: null, name: '', categoryKey, order: 0 };
}

/** Чип + имя категории + позиция → тело создания технологии. */
export function techChipToCreate(
  chip: TechChip,
  categoryName: string,
  order: number,
): CreateTechnology {
  return { name: chip.name.trim(), category: categoryName.trim() || undefined, order };
}

/* ---------- Языки (строки) ---------- */

/** Строка языка; `id: null` — новая. `pct` — строка для инпута. */
export interface LangRow {
  readonly key: string;
  readonly id: string | null;
  readonly name: string;
  readonly level: string;
  readonly pct: string;
}

/** Значение названия в активной локали (фолбэк на ru). */
function pickName(name: LocalizedText, locale: AppLanguage): string {
  return locale === 'en' ? (name.en ?? name.ru) : name.ru;
}

/** Админ-языки → строки редактора в активной локали. */
export function buildLangRows(items: readonly LanguageAdmin[], locale: AppLanguage): LangRow[] {
  return items.map((item) => ({
    key: item.id,
    id: item.id,
    name: pickName(item.name, locale),
    level: item.level,
    pct: String(item.pct),
  }));
}

/** Пустая строка языка для добавления. */
export function emptyLangRow(): LangRow {
  return { key: nextKey('new-lang'), id: null, name: '', level: '', pct: '' };
}

/** % владения → целое 0..100. */
export function clampPct(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, Math.min(100, parsed));
}

// Название при создании: база ru всегда заполнена; при правке en дублируем в ru.
function nameInput(locale: AppLanguage, value: string): { ru: string; en?: string } {
  return locale === 'en' ? { ru: value, en: value } : { ru: value };
}

// Название при обновлении: полная замена (UpdateLanguageDto.name — LocalizedTextInput),
// активную локаль правим, вторую переносим из текущего значения.
function nameUpdate(
  current: LocalizedText,
  locale: AppLanguage,
  value: string,
): { ru: string; en?: string } {
  if (locale === 'en') return { ru: current.ru, en: value };
  return { ru: value, ...(current.en != null ? { en: current.en } : {}) };
}

/** Строка → тело создания языка. */
export function rowToCreateLang(row: LangRow, locale: AppLanguage): CreateLanguage {
  return {
    name: nameInput(locale, row.name.trim()),
    level: row.level.trim() || 'A1',
    pct: clampPct(row.pct),
  };
}

/** Строка → тело обновления языка (обе локали названия). */
export function rowToUpdateLang(
  row: LangRow,
  current: LanguageAdmin,
  locale: AppLanguage,
): UpdateLanguage {
  return {
    name: nameUpdate(current.name, locale, row.name.trim()),
    level: row.level.trim() || current.level,
    pct: clampPct(row.pct),
  };
}

/* ---------- Навыки (плоские чипы) ---------- */

/** Чип навыка; `id: null` — ещё не сохранённый. `name` — в активной локали. `order` — с бэка. */
export interface SkillChip {
  readonly key: string;
  readonly id: string | null;
  readonly name: string;
  readonly order: number;
}

/** Админ-навыки → чипы в активной локали. */
export function buildSkillChips(items: readonly SkillAdmin[], locale: AppLanguage): SkillChip[] {
  return items.map((item) => ({
    key: item.id,
    id: item.id,
    name: pickName(item.name, locale),
    order: item.order,
  }));
}

/** Новый пустой чип навыка (локальный, без id) — заполняется инлайн (order — на сохранении). */
export function newSkillChip(): SkillChip {
  return { key: nextKey('new-skill'), id: null, name: '', order: 0 };
}

/** Чип + позиция → тело создания навыка (имя в активной локали, база ru заполнена). */
export function skillChipToCreate(
  chip: SkillChip,
  locale: AppLanguage,
  order: number,
): CreateSkill {
  return { name: nameInput(locale, chip.name.trim()), order };
}

/* ---------- Минимальный дифф порядка ---------- */

/** Запись последовательности для расчёта порядка: ключ, id (null — новая), позиция с бэка. */
interface Ordered {
  readonly key: string;
  readonly id: string | null;
  readonly order: number;
}

/**
 * Целевой `order` каждого элемента в желаемой последовательности при МИНИМУМЕ правок.
 *
 * Ключевая идея: сохраняем как «якоря» максимальный набор существующих элементов, чей
 * `order` уже идёт по возрастанию (наибольшая возрастающая подпоследовательность, LIS) —
 * их не трогаем. Остальным (новым и реально сдвинутым) выдаём ДРОБНУЮ позицию между
 * соседними якорями (или за пределами диапазона у краёв). Благодаря дробям перестановка
 * одного элемента (в т.ч. в начало) меняет `order` ровно у него, а не перенумеровывает
 * всех — поэтому `order` на бэке = Float. Контейнер шлёт PATCH только тем, у кого
 * новый `order` отличается от текущего.
 */
export function planMinimalOrders(seq: readonly Ordered[]): Map<string, number> {
  const existing: number[] = [];
  for (let i = 0; i < seq.length; i += 1) {
    if (seq[i].id !== null) existing.push(i);
  }

  // LIS по `order` среди существующих (строго возрастающая), с восстановлением набора.
  const anchors = new Set<number>();
  if (existing.length > 0) {
    const length = existing.map(() => 1);
    const parent = existing.map(() => -1);
    let best = 0;
    for (let a = 0; a < existing.length; a += 1) {
      for (let b = 0; b < a; b += 1) {
        if (seq[existing[b]].order < seq[existing[a]].order && length[b] + 1 > length[a]) {
          length[a] = length[b] + 1;
          parent[a] = b;
        }
      }
      if (length[a] > length[best]) best = a;
    }
    for (let k = best; k !== -1; k = parent[k]) anchors.add(existing[k]);
  }

  const plan = new Map<string, number>();
  let i = 0;
  while (i < seq.length) {
    if (anchors.has(i)) {
      plan.set(seq[i].key, seq[i].order);
      i += 1;
      continue;
    }
    // Прогон не-якорей [i, j); соседи слева/справа — якоря (или край).
    let j = i;
    while (j < seq.length && !anchors.has(j)) j += 1;
    const lo = i > 0 ? seq[i - 1].order : null;
    const hi = j < seq.length ? seq[j].order : null;
    const run = j - i;
    for (let r = 0; r < run; r += 1) {
      let value: number;
      if (lo === null && hi === null) value = r;
      else if (lo === null)
        value = hi - (run - r); // ниже hi, по возрастанию
      else if (hi === null)
        value = lo + (r + 1); // выше lo
      else value = lo + ((hi - lo) * (r + 1)) / (run + 1); // дробная середина
      plan.set(seq[i + r].key, value);
    }
    i = j;
  }
  return plan;
}

/** Порядок технологий: последовательность = категории по порядку × чипы внутри. */
export function planTechOrders(
  categories: readonly TechCategory[],
  chips: readonly TechChip[],
): Map<string, number> {
  const seq: TechChip[] = [];
  for (const category of categories) {
    for (const chip of chips.filter((item) => item.categoryKey === category.key)) seq.push(chip);
  }
  return planMinimalOrders(seq);
}

/** То же для плоского списка навыков. */
export function planSkillOrders(skillChips: readonly SkillChip[]): Map<string, number> {
  return planMinimalOrders(skillChips);
}

/* ---------- Счётчик изменений (для бара «N в диффе») ---------- */

/** Имя категории чипа в активном состоянии (по `categoryKey`). */
function categoryNameOf(categories: readonly TechCategory[], categoryKey: string): string {
  return categories.find((category) => category.key === categoryKey)?.name.trim() ?? '';
}

/**
 * Число изменений вкладки — ровно тех, что уйдут мутациями на сохранении: удаления +
 * новые записи + существующие со сменой категории или позиции (минимальный дифф порядка).
 * Имена технологий здесь не правятся. Совпадает с логикой контейнера ⇒ «N в диффе» = числу
 * запросов, поэтому удаление одного чипа даёт 1, а не перенумерацию всех.
 */
export function countStackChanges(args: {
  readonly initialCategories: readonly TechCategory[];
  readonly initialChips: readonly TechChip[];
  readonly initialLangRows: readonly LangRow[];
  readonly initialSkillChips: readonly SkillChip[];
  readonly categories: readonly TechCategory[];
  readonly chips: readonly TechChip[];
  readonly langRows: readonly LangRow[];
  readonly skillChips: readonly SkillChip[];
  readonly deletedTechIds: readonly string[];
  readonly deletedLangIds: readonly string[];
  readonly deletedSkillIds: readonly string[];
}): number {
  const techPlan = planTechOrders(args.categories, args.chips);
  const initialCatName = new Map(
    args.initialChips.map((chip) => [
      chip.id,
      categoryNameOf(args.initialCategories, chip.categoryKey),
    ]),
  );

  let count = args.deletedTechIds.length + args.deletedLangIds.length + args.deletedSkillIds.length;

  for (const chip of args.chips) {
    const category = categoryNameOf(args.categories, chip.categoryKey);
    if (chip.id === null) {
      // Новая технология уйдёт в create только с непустым именем и в названной категории.
      if (chip.name.trim() !== '' && category !== '') count += 1;
      continue;
    }
    const categoryChanged = (initialCatName.get(chip.id) ?? '') !== category;
    const orderChanged = techPlan.get(chip.key) !== chip.order;
    if (categoryChanged || orderChanged) count += 1;
  }

  const initialLangById = new Map(args.initialLangRows.map((row) => [row.id, row]));
  for (const row of args.langRows) {
    if (row.id === null) {
      if (row.name.trim() !== '') count += 1;
      continue;
    }
    const initial = initialLangById.get(row.id);
    if (initial === undefined) {
      count += 1;
      continue;
    }
    if (initial.name !== row.name || initial.level !== row.level || initial.pct !== row.pct) {
      count += 1;
    }
  }

  const skillPlan = planSkillOrders(args.skillChips);
  const initialSkillById = new Map(args.initialSkillChips.map((chip) => [chip.id, chip]));
  for (const chip of args.skillChips) {
    if (chip.id === null) {
      if (chip.name.trim() !== '') count += 1;
      continue;
    }
    const initial = initialSkillById.get(chip.id);
    if (initial === undefined) {
      count += 1;
      continue;
    }
    if (initial.name !== chip.name || skillPlan.get(chip.key) !== chip.order) count += 1;
  }

  return count;
}

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SaveBar } from '@/shared/ui';
import { Icon, Input } from '@sutuzhko/ui-kit';

import {
  countStackChanges,
  emptyLangRow,
  newSkillChip,
  newTechCategory,
  newTechChip,
  type LangRow,
  type SkillChip,
  type TechCategory,
  type TechChip,
} from '../model/stack-form';

import { InlineEdit } from './inline-edit';
import { SortableCategory } from './sortable-category';
import { SortableChip } from './sortable-chip';
import styles from './admin-stack.module.css';

/** Дифф, собранный видом для пакетного сохранения. */
export interface StackDiff {
  readonly techCategories: readonly TechCategory[];
  readonly chips: readonly TechChip[];
  readonly langRows: readonly LangRow[];
  readonly skillChips: readonly SkillChip[];
  readonly deletedTechIds: readonly string[];
  readonly deletedLangIds: readonly string[];
  readonly deletedSkillIds: readonly string[];
}

export interface AdminStackViewProps {
  /** Категории технологий (редактируемые заголовки блоков). */
  readonly techCategories: readonly TechCategory[];
  /** Технологии-чипы (привязаны к категориям по `categoryKey`). */
  readonly chips: readonly TechChip[];
  /** Строки языков из админ-данных. */
  readonly langRows: readonly LangRow[];
  /** Навыки-чипы (плоский список без категорий). */
  readonly skillChips: readonly SkillChip[];
  readonly isBusy: boolean;
  readonly onSave: (diff: StackDiff) => void;
}

/**
 * Вид вкладки «Стек и языки» — прямое редактирование:
 * — заголовок категории переименовывается по карандашу (появляется при наведении);
 * — технология добавляется чип-кнопкой «+» в блоке → пустой инлайн-чип;
 * — новый блок-категория добавляется «+» у заголовка «Технологии»;
 * — навыки устроены так же (плоский блок без категорий);
 * — языки — редактируемые строки.
 * Всё копится локально и уходит одним «Сохранить» — контейнер считает разницу.
 */
export function AdminStackView({
  techCategories: initialCategories,
  chips: initialChips,
  langRows: initialLangRows,
  skillChips: initialSkillChips,
  isBusy,
  onSave,
}: AdminStackViewProps) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<TechCategory[]>([...initialCategories]);
  const [chips, setChips] = useState<TechChip[]>([...initialChips]);
  const [langRows, setLangRows] = useState<LangRow[]>([...initialLangRows]);
  const [skillChips, setSkillChips] = useState<SkillChip[]>([...initialSkillChips]);
  const [deletedTechIds, setDeletedTechIds] = useState<string[]>([]);
  const [deletedLangIds, setDeletedLangIds] = useState<string[]>([]);
  const [deletedSkillIds, setDeletedSkillIds] = useState<string[]>([]);
  // Ключ чипа (технологии ИЛИ навыка), который сейчас вводится инлайн.
  const [editingChipKey, setEditingChipKey] = useState<string | null>(null);
  // Категория в режиме переименования + черновик её имени (имя не меняем до коммита).
  const [editingCategoryKey, setEditingCategoryKey] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState('');

  /* ---- категории ---- */
  const addCategory = (): void => {
    const category = newTechCategory();
    setCategories((prev) => [...prev, category]);
    setEditingCategoryKey(category.key);
    setCategoryDraft('');
  };

  const startRenameCategory = (category: TechCategory): void => {
    setEditingCategoryKey(category.key);
    setCategoryDraft(category.name);
  };

  const closeRename = (): void => {
    setEditingCategoryKey(null);
    setCategoryDraft('');
  };

  const commitCategory = (category: TechCategory): void => {
    const name = categoryDraft.trim();
    if (name !== '') {
      setCategories((prev) => prev.map((c) => (c.key === category.key ? { ...c, name } : c)));
    } else if (!chips.some((chip) => chip.categoryKey === category.key)) {
      // Пустое имя у категории без чипов — просто убираем её (новый пустой блок).
      setCategories((prev) => prev.filter((c) => c.key !== category.key));
    }
    closeRename();
  };

  const cancelCategory = (category: TechCategory): void => {
    // Новую (ещё не названную) категорию без чипов отменой убираем.
    if (category.name === '' && !chips.some((chip) => chip.categoryKey === category.key)) {
      setCategories((prev) => prev.filter((c) => c.key !== category.key));
    }
    closeRename();
  };

  // Удаление блока целиком: его сохранённые технологии уходят в deleted (на сейве
  // будут удалены), локально блок и его чипы исчезают. Обратимо до «Сохранить».
  const deleteCategory = (category: TechCategory): void => {
    const savedIds = chips
      .filter((chip) => chip.categoryKey === category.key && chip.id !== null)
      .map((chip) => chip.id ?? '');
    if (savedIds.length > 0) setDeletedTechIds((prev) => [...prev, ...savedIds]);
    setChips((prev) => prev.filter((chip) => chip.categoryKey !== category.key));
    setCategories((prev) => prev.filter((c) => c.key !== category.key));
    if (editingCategoryKey === category.key) closeRename();
  };

  /* ---- чипы технологий ---- */
  const addTechChip = (categoryKey: string): void => {
    const chip = newTechChip(categoryKey);
    setChips((prev) => [...prev, chip]);
    setEditingChipKey(chip.key);
  };

  const patchTechName = (key: string, name: string): void =>
    setChips((prev) => prev.map((chip) => (chip.key === key ? { ...chip, name } : chip)));

  const commitTechChip = (key: string): void => {
    setEditingChipKey(null);
    setChips((prev) => {
      const chip = prev.find((item) => item.key === key);
      return chip && chip.name.trim() === '' ? prev.filter((item) => item.key !== key) : prev;
    });
  };

  const cancelTechChip = (key: string): void => {
    setEditingChipKey(null);
    setChips((prev) => prev.filter((item) => item.key !== key));
  };

  const removeTech = (chip: TechChip): void => {
    if (chip.id !== null) setDeletedTechIds((prev) => [...prev, chip.id ?? '']);
    setChips((prev) => prev.filter((item) => item.key !== chip.key));
  };

  // Перетаскивание — мышью (после сдвига 6px, чтобы клики по ×/кнопкам работали) и
  // клавиатурой. Одни сенсоры на все списки (блоки, чипы каждой категории, навыки).
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Перенос блока-категории: меняем порядок категорий (плоский `Technology.order`
  // пересчитает контейнер на сохранении).
  const onCategoryDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (over === null || active.id === over.id) return;
    setCategories((prev) => {
      const from = prev.findIndex((category) => category.key === active.id);
      const to = prev.findIndex((category) => category.key === over.id);
      return from === -1 || to === -1 ? prev : arrayMove(prev, from, to);
    });
  };

  // Перенос чипа технологии — внутри своей категории (у каждой колонки свой DndContext,
  // поэтому цель всегда из той же категории). Reorder блоков — отдельная ручка на заголовке.
  const onChipDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (over === null || active.id === over.id) return;
    setChips((prev) => {
      const from = prev.findIndex((chip) => chip.key === active.id);
      const to = prev.findIndex((chip) => chip.key === over.id);
      if (from === -1 || to === -1 || prev[from]?.categoryKey !== prev[to]?.categoryKey)
        return prev;
      return arrayMove(prev, from, to);
    });
  };

  const onSkillDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (over === null || active.id === over.id) return;
    setSkillChips((prev) => {
      const from = prev.findIndex((chip) => chip.key === active.id);
      const to = prev.findIndex((chip) => chip.key === over.id);
      return from === -1 || to === -1 ? prev : arrayMove(prev, from, to);
    });
  };

  /* ---- чипы навыков ---- */
  const addSkillChip = (): void => {
    const chip = newSkillChip();
    setSkillChips((prev) => [...prev, chip]);
    setEditingChipKey(chip.key);
  };

  const patchSkillName = (key: string, name: string): void =>
    setSkillChips((prev) => prev.map((chip) => (chip.key === key ? { ...chip, name } : chip)));

  const commitSkillChip = (key: string): void => {
    setEditingChipKey(null);
    setSkillChips((prev) => {
      const chip = prev.find((item) => item.key === key);
      return chip && chip.name.trim() === '' ? prev.filter((item) => item.key !== key) : prev;
    });
  };

  const cancelSkillChip = (key: string): void => {
    setEditingChipKey(null);
    setSkillChips((prev) => prev.filter((item) => item.key !== key));
  };

  const removeSkill = (chip: SkillChip): void => {
    if (chip.id !== null) setDeletedSkillIds((prev) => [...prev, chip.id ?? '']);
    setSkillChips((prev) => prev.filter((item) => item.key !== chip.key));
  };

  /* ---- языки ---- */
  const patchLang = (key: string, patch: Partial<LangRow>): void =>
    setLangRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const removeLang = (row: LangRow): void => {
    if (row.id !== null) setDeletedLangIds((prev) => [...prev, row.id ?? '']);
    setLangRows((prev) => prev.filter((item) => item.key !== row.key));
  };

  const addLang = (): void => setLangRows((prev) => [...prev, emptyLangRow()]);

  // Отмена: вернуть все три списка (и служебные состояния) к загруженным.
  const cancel = (): void => {
    setCategories([...initialCategories]);
    setChips([...initialChips]);
    setLangRows([...initialLangRows]);
    setSkillChips([...initialSkillChips]);
    setDeletedTechIds([]);
    setDeletedLangIds([]);
    setDeletedSkillIds([]);
    setEditingChipKey(null);
    setEditingCategoryKey(null);
    setCategoryDraft('');
  };

  // Счётчик правок (для бара «N в диффе») = число мутаций, что уйдут на сохранении.
  const changeCount = countStackChanges({
    initialCategories,
    initialChips,
    initialLangRows,
    initialSkillChips,
    categories,
    chips,
    langRows,
    skillChips,
    deletedTechIds,
    deletedLangIds,
    deletedSkillIds,
  });

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>{t('admin.stack.title')}</h2>
          <span className={styles.endpoint}>
            CRUD /api/technologies · /api/languages · /api/skills
          </span>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>{t('admin.stack.tech')}</span>
          <button type="button" className={styles.addBlock} onClick={addCategory}>
            {t('admin.stack.addCategory')}
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onCategoryDragEnd}
        >
          <SortableContext
            items={categories.map((category) => category.key)}
            strategy={rectSortingStrategy}
          >
            <div className={styles.techGrid}>
              {categories.map((category) => {
                const categoryChips = chips.filter((chip) => chip.categoryKey === category.key);
                const sortableKeys = categoryChips
                  .filter((chip) => chip.key !== editingChipKey)
                  .map((chip) => chip.key);
                return (
                  <SortableCategory key={category.key} id={category.key} name={category.name}>
                    {(dragHandle) => (
                      <>
                        <div className={styles.categoryHead}>
                          {editingCategoryKey === category.key ? (
                            <InlineEdit
                              value={categoryDraft}
                              ariaLabel={t('admin.stack.categoryName')}
                              placeholder={t('admin.stack.categoryPlaceholder')}
                              className={styles.categoryInput}
                              onChange={setCategoryDraft}
                              onCommit={() => commitCategory(category)}
                              onCancel={() => cancelCategory(category)}
                            />
                          ) : (
                            <>
                              {dragHandle}
                              <span className={styles.categoryLabel}>{category.name}</span>
                              <button
                                type="button"
                                className={styles.categoryEdit}
                                onClick={() => startRenameCategory(category)}
                                aria-label={t('admin.stack.renameCategory', {
                                  name: category.name,
                                })}
                              >
                                <Icon name="edit" size={12} />
                              </button>
                              <button
                                type="button"
                                className={styles.categoryDelete}
                                onClick={() => deleteCategory(category)}
                                aria-label={t('admin.stack.removeBlock', { name: category.name })}
                              >
                                <Icon name="trash" size={12} />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Свой DndContext на колонку: чипы сортируются только внутри
                            своей категории, а клавиатурный reorder не «цепляется» за
                            чужие блоки/чипы (иначе sortableKeyboardCoordinates ищет цель
                            среди всех droppable). Reorder блоков — во внешнем DndContext. */}
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={onChipDragEnd}
                        >
                          <div className={styles.chips}>
                            <SortableContext items={sortableKeys} strategy={rectSortingStrategy}>
                              {categoryChips.map((chip) =>
                                chip.key === editingChipKey ? (
                                  <InlineEdit
                                    key={chip.key}
                                    value={chip.name}
                                    ariaLabel={t('admin.stack.techName')}
                                    placeholder={t('admin.stack.techPlaceholder')}
                                    onChange={(value) => patchTechName(chip.key, value)}
                                    onCommit={() => commitTechChip(chip.key)}
                                    onCancel={() => cancelTechChip(chip.key)}
                                  />
                                ) : (
                                  <SortableChip
                                    key={chip.key}
                                    id={chip.key}
                                    name={chip.name}
                                    removeLabel={t('admin.stack.removeTech', { name: chip.name })}
                                    onRemove={() => removeTech(chip)}
                                  />
                                ),
                              )}
                            </SortableContext>
                            <button
                              type="button"
                              className={styles.addChip}
                              onClick={() => addTechChip(category.key)}
                              aria-label={t('admin.stack.addTechTo', { category: category.name })}
                            >
                              <Icon name="plus" size={13} />
                            </button>
                          </div>
                        </DndContext>
                      </>
                    )}
                  </SortableCategory>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        <div className={styles.langSection}>
          <div className={styles.langHead}>
            <span className={styles.sectionLabel}>{t('admin.stack.lang')}</span>
            <button type="button" className={styles.langAdd} onClick={addLang}>
              <Icon name="plus" size={13} />
              {t('admin.stack.langAdd')}
            </button>
          </div>

          {langRows.length === 0 ? (
            <p className={styles.empty}>{t('admin.stack.langEmpty')}</p>
          ) : null}

          <div className={styles.langRows}>
            {langRows.map((row) => (
              <div key={row.key} className={styles.langRow}>
                <div className={styles.langName}>
                  <Input
                    aria-label={t('admin.stack.langName')}
                    value={row.name}
                    onChange={(event) => patchLang(row.key, { name: event.target.value })}
                  />
                </div>
                <div className={styles.langLevel}>
                  <Input
                    aria-label={t('admin.stack.level')}
                    value={row.level}
                    onChange={(event) => patchLang(row.key, { level: event.target.value })}
                  />
                </div>
                <div className={styles.langPct}>
                  <Input
                    aria-label={t('admin.stack.pct')}
                    inputMode="numeric"
                    value={row.pct}
                    onChange={(event) => patchLang(row.key, { pct: event.target.value })}
                  />
                </div>
                <span className={styles.pctSign}>%</span>
                <button
                  type="button"
                  className={styles.langRemove}
                  onClick={() => removeLang(row)}
                  aria-label={t('admin.stack.removeLang')}
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.skillSection}>
          <span className={styles.sectionLabel}>{t('admin.stack.skills')}</span>
          <p className={styles.skillHint}>{t('admin.stack.skillHint')}</p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onSkillDragEnd}
          >
            <div className={styles.chips}>
              <SortableContext
                items={skillChips
                  .filter((chip) => chip.key !== editingChipKey)
                  .map((chip) => chip.key)}
                strategy={rectSortingStrategy}
              >
                {skillChips.map((chip) =>
                  chip.key === editingChipKey ? (
                    <InlineEdit
                      key={chip.key}
                      value={chip.name}
                      ariaLabel={t('admin.stack.skillName')}
                      placeholder={t('admin.stack.skillPlaceholder')}
                      onChange={(value) => patchSkillName(chip.key, value)}
                      onCommit={() => commitSkillChip(chip.key)}
                      onCancel={() => cancelSkillChip(chip.key)}
                    />
                  ) : (
                    <SortableChip
                      key={chip.key}
                      id={chip.key}
                      name={chip.name}
                      removeLabel={t('admin.stack.removeSkill', { name: chip.name })}
                      onRemove={() => removeSkill(chip)}
                    />
                  ),
                )}
              </SortableContext>
              <button
                type="button"
                className={styles.addChip}
                onClick={addSkillChip}
                aria-label={t('admin.stack.addSkill')}
              >
                <Icon name="plus" size={13} />
              </button>
            </div>
          </DndContext>
        </div>
      </div>

      <SaveBar
        visible={changeCount > 0}
        isSaving={isBusy}
        count={changeCount}
        onSave={() =>
          onSave({
            techCategories: categories,
            chips,
            langRows,
            skillChips,
            deletedTechIds,
            deletedLangIds,
            deletedSkillIds,
          })
        }
        onCancel={cancel}
      />
    </section>
  );
}

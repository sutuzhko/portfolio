import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '@/shared/config';
import { ConfirmDialog } from '@sutuzhko/ui-kit';

import { useSortableSensors } from '@/shared/lib';

import { pickText } from '../model/project-form';
import type { StagedContributor } from '../model/contributor-staging';

import { ContributorForm, type ContributorDraft } from './contributor-form';
import { SortableContributorChip } from './sortable-contributor-chip';
import styles from './admin-projects.module.css';

export interface ContributorManagerProps {
  readonly locale: AppLanguage;
  readonly disabled: boolean;
  /** Видимый черновик каталога (без помеченных на удаление) — в желаемом порядке. */
  readonly staged: readonly StagedContributor[];
  readonly selectedIds: readonly string[];
  /** Тоггл участника в проекте. */
  readonly onToggle: (id: string) => void;
  /** Застейджить создание (применяется на «Сохранить» проекта). */
  readonly onStageCreate: (draft: ContributorDraft) => void;
  /** Застейджить правку каталожной записи. */
  readonly onStageUpdate: (id: string, draft: ContributorDraft) => void;
  /** Застейджить удаление из каталога. */
  readonly onStageDelete: (id: string) => void;
  /** Перетаскивание: участник `activeId` встаёт на место `overId` (порядок каталога). */
  readonly onReorder: (activeId: string, overId: string) => void;
}

// Состояние встроенного редактора: закрыт / создание / правка конкретной записи.
type Editor =
  | { readonly kind: 'closed' }
  | { readonly kind: 'create' }
  | { readonly kind: 'edit'; readonly contributor: StagedContributor };

/**
 * Управление участниками проекта: чипы-выбор из каталога (у каждого — ручка
 * перетаскивания и карандаш правки), инлайн-форма создания/правки и подтверждение
 * удаления. Порядок чипов — глобальный порядок каталога: в нём участники идут и на
 * публичных плитках. Весь CRUD и перестановка **стейджатся**: колбэки лишь копят
 * черновик, а реальные запросы уходят одним пакетом при сохранении проекта.
 * Презентационный, состояние редактора — локальное.
 */
export function ContributorManager({
  locale,
  disabled,
  staged,
  selectedIds,
  onToggle,
  onStageCreate,
  onStageUpdate,
  onStageDelete,
  onReorder,
}: ContributorManagerProps) {
  const { t } = useTranslation();
  const sensors = useSortableSensors();
  const [editor, setEditor] = useState<Editor>({ kind: 'closed' });
  const [confirmDelete, setConfirmDelete] = useState<StagedContributor | null>(null);

  const close = (): void => setEditor({ kind: 'closed' });

  const handleCreate = (draft: ContributorDraft): void => {
    onStageCreate(draft);
    close();
  };

  const handleUpdate = (contributor: StagedContributor, draft: ContributorDraft): void => {
    onStageUpdate(contributor.id, draft);
    close();
  };

  const handleDelete = (contributor: StagedContributor): void => {
    onStageDelete(contributor.id);
    setConfirmDelete(null);
    close();
  };

  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    if (over === null || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  };

  return (
    <fieldset className={styles.field}>
      <legend className={styles.inlineLabel}>{t('admin.projects.contributors')}</legend>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className={styles.chips}>
          <SortableContext
            items={staged.map((contributor) => contributor.id)}
            strategy={rectSortingStrategy}
          >
            {staged.map((contributor) => (
              <SortableContributorChip
                key={contributor.id}
                id={contributor.id}
                label={pickText(contributor.name, locale)}
                color={contributor.color}
                selected={selectedIds.includes(contributor.id)}
                editing={editor.kind === 'edit' && editor.contributor.id === contributor.id}
                disabled={disabled}
                onToggle={() => onToggle(contributor.id)}
                onEdit={() => setEditor({ kind: 'edit', contributor })}
              />
            ))}
          </SortableContext>
          {/* «+ создать участника» — последним элементом ряда чипов (как в макете). */}
          <button
            type="button"
            className={styles.chipAdd}
            disabled={disabled}
            onClick={() => setEditor({ kind: 'create' })}
          >
            {t('admin.projects.contributorAdd')}
          </button>
        </div>
      </DndContext>

      {editor.kind === 'create' ? (
        <ContributorForm
          disabled={disabled}
          submitLabel={t('admin.projects.contributorSave')}
          onSubmit={handleCreate}
          onCancel={close}
        />
      ) : null}

      {editor.kind === 'edit' ? (
        <ContributorForm
          initial={{
            name: pickText(editor.contributor.name, locale),
            color: editor.contributor.color ?? '',
            image: editor.contributor.image ?? '',
            link: editor.contributor.link ?? '',
          }}
          disabled={disabled}
          submitLabel={t('admin.projects.contributorUpdate')}
          onSubmit={(draft) => handleUpdate(editor.contributor, draft)}
          onCancel={close}
          onDelete={() => setConfirmDelete(editor.contributor)}
        />
      ) : null}

      <ConfirmDialog
        open={confirmDelete !== null}
        title={t('admin.projects.contributorConfirmTitle')}
        message={t('admin.projects.contributorConfirmText', {
          name: confirmDelete ? pickText(confirmDelete.name, locale) : '',
        })}
        confirmLabel={t('admin.projects.contributorDelete')}
        cancelLabel={t('admin.projects.cancel')}
        busy={disabled}
        onConfirm={() => {
          if (confirmDelete) handleDelete(confirmDelete);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </fieldset>
  );
}

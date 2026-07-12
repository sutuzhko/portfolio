import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '@/shared/config';
import { Button, Chip, ConfirmDialog, Icon } from '@sutuzhko/ui-kit';

import { pickText } from '../model/project-form';
import type { StagedContributor } from '../model/contributor-staging';

import { ContributorForm, type ContributorDraft } from './contributor-form';
import styles from './admin-projects.module.css';

export interface ContributorManagerProps {
  readonly locale: AppLanguage;
  readonly disabled: boolean;
  /** Видимый черновик каталога (без помеченных на удаление). */
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
}

// Состояние встроенного редактора: закрыт / создание / правка конкретной записи.
type Editor =
  | { readonly kind: 'closed' }
  | { readonly kind: 'create' }
  | { readonly kind: 'edit'; readonly contributor: StagedContributor };

/**
 * Управление участниками проекта: чипы-выбор из каталога (у каждого — карандаш
 * правки), инлайн-форма создания/правки и подтверждение удаления. Весь CRUD
 * каталога **стейджится**: колбэки лишь копят черновик, а реальные запросы
 * уходят одним пакетом при сохранении проекта. Презентационный, состояние
 * редактора — локальное.
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
}: ContributorManagerProps) {
  const { t } = useTranslation();
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

  return (
    <fieldset className={styles.field}>
      <legend className={styles.inlineLabel}>{t('admin.projects.contributors')}</legend>
      <div className={styles.chips}>
        {staged.map((contributor) => {
          const selected = selectedIds.includes(contributor.id);
          const label = pickText(contributor.name, locale);
          return (
            <span key={contributor.id} className={styles.chipWrap}>
              <Chip selected={selected} onClick={() => onToggle(contributor.id)}>
                {label}
              </Chip>
              <button
                type="button"
                className={styles.chipEdit}
                disabled={disabled}
                aria-label={t('admin.projects.contributorEditName', { name: label })}
                onClick={() => setEditor({ kind: 'edit', contributor })}
              >
                <Icon name="edit" size={13} />
              </button>
            </span>
          );
        })}
      </div>

      {editor.kind === 'closed' ? (
        <Button
          variant="ghost"
          size="sm"
          className={styles.contributorAdd}
          disabled={disabled}
          onClick={() => setEditor({ kind: 'create' })}
        >
          {t('admin.projects.contributorAdd')}
        </Button>
      ) : null}

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
            color: editor.contributor.color ?? '#238636',
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

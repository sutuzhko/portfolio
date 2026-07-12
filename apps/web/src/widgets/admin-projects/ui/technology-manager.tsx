import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import { Button, Chip } from '@sutuzhko/ui-kit';

import type { StagedTechnology, TechnologyDraft } from '../model/technology-staging';

import { TechnologyForm } from './technology-form';
import styles from './admin-projects.module.css';

export interface TechnologyManagerProps {
  readonly disabled: boolean;
  /** Видимый каталог технологий (для выбора/добавления). */
  readonly staged: readonly StagedTechnology[];
  readonly selectedIds: readonly string[];
  /** Ошибка обязательности (нет выбранных технологий). */
  readonly error?: string;
  /** Добавить/убрать технологию из проекта. */
  readonly onToggle: (id: string) => void;
  /** Создать новую технологию в каталоге (автоматически выбирается). */
  readonly onStageCreate: (draft: TechnologyDraft) => void;
}

// closed — только чипы; picker — выбор существующей; create — форма новой.
type Mode = 'closed' | 'picker' | 'create';

/**
 * Технологии проекта: выбранные показаны чипами в стиле «Стека» (имя + ×, ×
 * убирает из проекта). «+ добавить» открывает панель — выбрать существующую из
 * каталога или создать новую (уходит в каталог одним пакетом при сохранении).
 * Правка/удаление технологий из каталога — на вкладке «Стек». Минимум одна
 * технология обязательна.
 */
export function TechnologyManager({
  disabled,
  staged,
  selectedIds,
  error,
  onToggle,
  onStageCreate,
}: TechnologyManagerProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('closed');

  const selected = staged.filter((technology) => selectedIds.includes(technology.id));
  const unselected = staged.filter((technology) => !selectedIds.includes(technology.id));

  const handleCreate = (draft: TechnologyDraft): void => {
    onStageCreate(draft);
    setMode('picker');
  };

  return (
    <fieldset className={styles.field}>
      <legend className={cn(styles.inlineLabel, styles.required)}>
        {t('admin.projects.technologies')}
      </legend>

      <div className={styles.chips}>
        {selected.map((technology) => (
          <span key={technology.id} className={styles.techChip}>
            {technology.name}
            <button
              type="button"
              className={styles.techChipRemove}
              disabled={disabled}
              aria-label={t('admin.projects.technologyRemoveName', { name: technology.name })}
              onClick={() => onToggle(technology.id)}
            >
              ×
            </button>
          </span>
        ))}
        <button
          type="button"
          className={styles.chipAdd}
          disabled={disabled}
          onClick={() => setMode((current) => (current === 'closed' ? 'picker' : 'closed'))}
        >
          {t('admin.projects.technologyAdd')}
        </button>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      {mode === 'picker' ? (
        <div className={styles.contributorCreate}>
          <span className={styles.inlineLabel}>{t('admin.projects.technologyPick')}</span>
          <div className={styles.chips}>
            {unselected.length > 0 ? (
              unselected.map((technology) => (
                <Chip key={technology.id} onClick={() => onToggle(technology.id)}>
                  {technology.name}
                </Chip>
              ))
            ) : (
              <span className={styles.pickerEmpty}>{t('admin.projects.technologyAllAdded')}</span>
            )}
          </div>
          <div className={styles.contributorCreateActions}>
            <Button
              variant="primary"
              size="sm"
              disabled={disabled}
              onClick={() => setMode('create')}
            >
              {t('admin.projects.technologyCreateNew')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setMode('closed')}>
              {t('admin.projects.technologyDone')}
            </Button>
          </div>
        </div>
      ) : null}

      {mode === 'create' ? (
        <TechnologyForm
          disabled={disabled}
          submitLabel={t('admin.projects.technologySave')}
          onSubmit={handleCreate}
          onCancel={() => setMode('picker')}
        />
      ) : null}
    </fieldset>
  );
}

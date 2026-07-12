import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Icon, Input } from '@sutuzhko/ui-kit';

import type { TechnologyDraft } from '../model/technology-staging';
import styles from './admin-projects.module.css';

const EMPTY_DRAFT: TechnologyDraft = { name: '', category: '' };

interface TechnologyFormProps {
  /** Начальные значения (правка); без них — создание. */
  readonly initial?: TechnologyDraft;
  readonly disabled: boolean;
  readonly submitLabel: string;
  readonly onSubmit: (draft: TechnologyDraft) => void;
  readonly onCancel: () => void;
  /** Удаление (только правка) — открывает подтверждение у менеджера. */
  readonly onDelete?: () => void;
}

/**
 * Форма технологии (создание и правка): имя (простая строка) и необязательная
 * категория. Презентационная: своё состояние полей, наружу — колбэки.
 */
export function TechnologyForm({
  initial,
  disabled,
  submitLabel,
  onSubmit,
  onCancel,
  onDelete,
}: TechnologyFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.name ?? EMPTY_DRAFT.name);
  const [category, setCategory] = useState(initial?.category ?? EMPTY_DRAFT.category);

  const canSubmit = name.trim().length > 0 && !disabled;

  const submit = (): void => {
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), category: category.trim() });
  };

  return (
    <div className={styles.contributorCreate}>
      <Input
        label={t('admin.projects.technologyName')}
        labelVariant="plain"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Input
        label={t('admin.projects.technologyCategory')}
        labelVariant="plain"
        placeholder={t('admin.projects.technologyCategoryPlaceholder')}
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      />
      <div className={styles.contributorCreateActions}>
        <Button variant="primary" size="sm" disabled={!canSubmit} onClick={submit}>
          {submitLabel}
        </Button>
        <Button variant="ghost" size="sm" disabled={disabled} onClick={onCancel}>
          {t('admin.projects.cancel')}
        </Button>
        {onDelete ? (
          <Button
            variant="ghost"
            size="sm"
            className={styles.contributorDelete}
            disabled={disabled}
            onClick={onDelete}
          >
            <Icon name="trash" size={14} />
            {t('admin.projects.technologyDelete')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

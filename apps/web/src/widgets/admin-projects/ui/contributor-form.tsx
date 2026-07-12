import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import { Button, Icon, Input } from '@sutuzhko/ui-kit';

import { CONTRIBUTOR_COLORS } from '../model/project-form';
import styles from './admin-projects.module.css';

/** Черновик участника (строки формы; локаль имени накладывает менеджер). */
export interface ContributorDraft {
  readonly name: string;
  readonly color: string;
  /** URL аватара (необязателен) — при отсутствии показываем инициалы на `color`. */
  readonly image: string;
  /** Внешняя ссылка на профиль (необязательна) — делает участника кликабельным. */
  readonly link: string;
}

const DEFAULT_COLOR = CONTRIBUTOR_COLORS[0] ?? '#238636';

const EMPTY_DRAFT: ContributorDraft = { name: '', color: DEFAULT_COLOR, image: '', link: '' };

interface ContributorFormProps {
  /** Начальные значения (правка); без них — создание с пустыми полями. */
  readonly initial?: ContributorDraft;
  readonly disabled: boolean;
  /** Подпись кнопки подтверждения (добавить/сохранить). */
  readonly submitLabel: string;
  readonly onSubmit: (draft: ContributorDraft) => void;
  readonly onCancel: () => void;
  /** Удаление (только правка) — открывает подтверждение у менеджера. */
  readonly onDelete?: () => void;
}

/**
 * Форма участника (создание и правка): имя в активной локали, цвет аватара и
 * опциональная ссылка. Локаль-логику имени владеет `ContributorManager` — форма
 * оперирует «сырыми» строками. Презентационная: своё состояние полей, наружу —
 * колбэки submit/cancel/delete.
 */
export function ContributorForm({
  initial,
  disabled,
  submitLabel,
  onSubmit,
  onCancel,
  onDelete,
}: ContributorFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.name ?? EMPTY_DRAFT.name);
  const [color, setColor] = useState(initial?.color ?? EMPTY_DRAFT.color);
  const [image, setImage] = useState(initial?.image ?? EMPTY_DRAFT.image);
  const [link, setLink] = useState(initial?.link ?? EMPTY_DRAFT.link);

  const canSubmit = name.trim().length > 0 && !disabled;

  const submit = (): void => {
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), color, image: image.trim(), link: link.trim() });
  };

  return (
    <div className={styles.contributorCreate}>
      <Input
        label={t('admin.projects.contributorName')}
        labelVariant="plain"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <div className={styles.field}>
        <span className={styles.inlineLabel}>{t('admin.projects.contributorColor')}</span>
        <div
          className={styles.palette}
          role="radiogroup"
          aria-label={t('admin.projects.contributorColor')}
        >
          {/* «Без цвета» — сброс к дефолтному аватару-градиенту (на сохранении → null). */}
          <button
            type="button"
            role="radio"
            aria-checked={!color}
            aria-label={t('admin.projects.contributorColorNone')}
            title={t('admin.projects.contributorColorNone')}
            className={cn(styles.swatch, styles.swatchNone)}
            onClick={() => setColor('')}
          />
          {CONTRIBUTOR_COLORS.map((swatch) => (
            <button
              key={swatch}
              type="button"
              role="radio"
              aria-checked={color === swatch}
              aria-label={swatch}
              className={styles.swatch}
              style={{ background: swatch }}
              onClick={() => setColor(swatch)}
            />
          ))}
        </div>
      </div>
      <Input
        label={t('admin.projects.contributorImage')}
        labelVariant="plain"
        placeholder={t('admin.projects.contributorImagePlaceholder')}
        value={image}
        onChange={(event) => setImage(event.target.value)}
      />
      <Input
        label={t('admin.projects.contributorLink')}
        labelVariant="plain"
        value={link}
        onChange={(event) => setLink(event.target.value)}
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
            {t('admin.projects.contributorDelete')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

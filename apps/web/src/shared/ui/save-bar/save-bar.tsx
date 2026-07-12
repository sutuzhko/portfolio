import { useTranslation } from 'react-i18next';

import { Icon } from '@sutuzhko/ui-kit';

import styles from './save-bar.module.css';

export interface SaveBarProps {
  /** Показывать бар — только при наличии несохранённых изменений (`isDirty`/дифф > 0).
   * Форм-редакторы дают отдельную кнопку «Закрыть» в шапке, поэтому бар тоже гейтится. */
  readonly visible: boolean;
  /** Идёт сохранение — блокирует обе кнопки. */
  readonly isSaving: boolean;
  /**
   * «Сохранить» как submit формы (RHF отправляет через `onSubmit`) или обычная
   * кнопка с `onSave`. По умолчанию — обычная кнопка.
   */
  readonly saveType?: 'button' | 'submit';
  /** Обработчик сохранения (для `saveType="button"`). */
  readonly onSave?: () => void;
  /** Отмена — вернуть значения к загруженным (или закрыть редактор). */
  readonly onCancel: () => void;
  /** Активна ли «Сохранить» (по умолчанию — да, пока не идёт сохранение). */
  readonly canSave?: boolean;
  /**
   * Число изменений в диффе. Если задано — показывается в подписи («N в диффе») и на
   * кнопке («Сохранить N»), как на вкладке «Локализация». Без него — просто «Сохранить».
   */
  readonly count?: number;
}

/**
 * Единый плавающий бар сохранения кабинета: прилипает к нижнему правому углу окна и
 * появляется, когда есть несохранённые изменения (`visible`). Оформление — как на
 * вкладке «Локализация»: жёлтая точка-индикатор, сводка со счётчиком правок, «Отменить»
 * и «Сохранить N». Сам не знает, что именно сохраняется: логика — в родителе
 * (`onSave`/`onCancel`), поэтому переиспользуется всеми вкладками. Для форм на RHF
 * кнопка — `submit` внутри `<form>` (нажатие уходит в `onSubmit`), `onSave` не нужен.
 */
export function SaveBar({
  visible,
  isSaving,
  saveType = 'button',
  onSave,
  onCancel,
  canSave = true,
  count,
}: SaveBarProps) {
  const { t } = useTranslation();
  if (!visible) return null;

  // Есть правки, если счётчик не задан (батч-вкладки показывают бар только при isDirty)
  // или больше нуля. Пустой редактор-форма (count === 0) — бар без сводки, только кнопки.
  const hasChanges = count == null || count > 0;
  const saveLabel =
    count == null || count === 0 ? t('admin.save') : t('admin.saveCount', { count });

  return (
    <div className={styles.bar} role="region" aria-label={t('admin.unsaved')}>
      {hasChanges ? (
        <>
          <span className={styles.dot} aria-hidden />
          <div className={styles.meta}>
            <span className={styles.title}>{t('admin.unsaved')}</span>
            {count != null ? (
              <span className={styles.subtitle}>{t('admin.diffCount', { count })}</span>
            ) : null}
          </div>
        </>
      ) : null}

      <button type="button" className={styles.discard} onClick={onCancel} disabled={isSaving}>
        {t('admin.cancel')}
      </button>

      <button
        type={saveType === 'submit' ? 'submit' : 'button'}
        className={styles.submit}
        onClick={saveType === 'submit' ? undefined : onSave}
        disabled={isSaving || !canSave}
      >
        <Icon name="success" size={14} />
        {saveLabel}
      </button>
    </div>
  );
}

import { useTranslation } from 'react-i18next';

import { Icon } from '@sutuzhko/ui-kit';

import styles from './admin-projects.module.css';

interface BulletsEditorProps {
  /** Пункты, склеенные через `\n` (формат хранения формы). */
  readonly value: string;
  readonly onChange: (value: string) => void;
}

/** Разбирает строку в массив строк-пунктов (пустая строка → нет пунктов). */
function toRows(value: string): string[] {
  return value.length > 0 ? value.split('\n') : [];
}

/**
 * Редактор «Ключевых пунктов»: нумерованные строки-инпуты с добавлением/удалением.
 * Управляемый адаптер над строковым полем формы (`\n`-разделённым) — модель и
 * бэкенд-формат не меняются, пустые пункты отсекаются при сохранении.
 */
export function BulletsEditor({ value, onChange }: BulletsEditorProps) {
  const { t } = useTranslation();
  const rows = toRows(value);

  const setRow = (index: number, next: string): void => {
    onChange(rows.map((row, i) => (i === index ? next : row)).join('\n'));
  };
  const removeRow = (index: number): void => {
    onChange(rows.filter((_, i) => i !== index).join('\n'));
  };
  const addRow = (): void => {
    onChange([...rows, ''].join('\n'));
  };

  return (
    <div className={styles.rowsField}>
      <span className={styles.inlineLabel}>{t('admin.projects.bullets')}</span>
      <div className={styles.rows}>
        {rows.map((row, index) => (
          <div key={index} className={styles.bulletRow}>
            <span className={styles.rowNum}>{String(index + 1).padStart(2, '0')}</span>
            <input
              className={styles.rowInput}
              value={row}
              onChange={(event) => setRow(index, event.target.value)}
              aria-label={t('admin.projects.bulletRow', { n: index + 1 })}
            />
            <button
              type="button"
              className={styles.rowRemove}
              aria-label={t('admin.projects.bulletRemove')}
              title={t('admin.projects.bulletRemove')}
              onClick={() => removeRow(index)}
            >
              <Icon name="trash" size={13} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={styles.rowAdd} onClick={addRow}>
        {t('admin.projects.bulletAdd')}
      </button>
    </div>
  );
}

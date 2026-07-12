import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import { Icon } from '@sutuzhko/ui-kit';

import styles from './admin-projects.module.css';

interface LinkRow {
  readonly name: string;
  readonly url: string;
}

interface LinksEditorProps {
  /** Ссылки, каждая строкой «Название | URL» (формат хранения формы). */
  readonly value: string;
  readonly onChange: (value: string) => void;
}

/** Разбирает строки «Название | URL» в пары (пустое значение → нет ссылок). */
function toRows(value: string): LinkRow[] {
  if (value.length === 0) return [];
  return value.split('\n').map((line) => {
    const sep = line.indexOf('|');
    if (sep < 0) return { name: '', url: line.trim() };
    return { name: line.slice(0, sep).trim(), url: line.slice(sep + 1).trim() };
  });
}

/** Собирает пары обратно в строку «Название | URL» на строку. */
function serialize(rows: readonly LinkRow[]): string {
  return rows.map((row) => `${row.name} | ${row.url}`).join('\n');
}

/**
 * Редактор «Ссылок»: строки «Название | URL» с добавлением/удалением. Управляемый
 * адаптер над строковым полем формы — модель и бэкенд-формат не меняются (пустые
 * ссылки отсекаются при сохранении).
 */
export function LinksEditor({ value, onChange }: LinksEditorProps) {
  const { t } = useTranslation();
  const rows = toRows(value);

  const setRow = (index: number, patch: Partial<LinkRow>): void => {
    onChange(serialize(rows.map((row, i) => (i === index ? { ...row, ...patch } : row))));
  };
  const removeRow = (index: number): void => {
    onChange(serialize(rows.filter((_, i) => i !== index)));
  };
  const addRow = (): void => {
    onChange(serialize([...rows, { name: '', url: '' }]));
  };

  return (
    <div className={styles.rowsField}>
      <span className={styles.inlineLabel}>{t('admin.projects.links')}</span>
      <div className={styles.rows}>
        {rows.map((row, index) => (
          <div key={index} className={styles.linkRow}>
            <input
              className={styles.rowInput}
              value={row.name}
              onChange={(event) => setRow(index, { name: event.target.value })}
              placeholder={t('admin.projects.linkName')}
              aria-label={t('admin.projects.linkNameRow', { n: index + 1 })}
            />
            <input
              className={cn(styles.rowInput, styles.rowInputMono)}
              value={row.url}
              onChange={(event) => setRow(index, { url: event.target.value })}
              placeholder={t('admin.projects.linkUrl')}
              aria-label={t('admin.projects.linkUrlRow', { n: index + 1 })}
            />
            <button
              type="button"
              className={styles.rowRemove}
              aria-label={t('admin.projects.linkRemove')}
              title={t('admin.projects.linkRemove')}
              onClick={() => removeRow(index)}
            >
              <Icon name="trash" size={13} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={styles.rowAdd} onClick={addRow}>
        {t('admin.projects.linkAdd')}
      </button>
    </div>
  );
}

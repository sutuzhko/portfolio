import {
  effective,
  isChanged,
  isMissingEn,
  isSameAsRu,
  type LocEdits,
  type LocRow,
} from '../model/loc-rows';

import { LocCell, type LocCellLabels, type LocLocale } from './loc-cell';
import styles from './admin-localization.module.css';

/** Подписи флагов строки. */
export interface LocFlagLabels {
  readonly missing: string;
  readonly same: string;
  readonly changed: string;
}

export interface LocTableRowProps {
  readonly row: LocRow;
  readonly edits: LocEdits;
  /** Какая локаль этой строки редактируется (или null). */
  readonly editingLocale: LocLocale | null;
  readonly ruLabels: LocCellLabels;
  readonly enLabels: LocCellLabels;
  readonly flagLabels: LocFlagLabels;
  readonly onEdit: (locale: LocLocale) => void;
  readonly onCommit: (locale: LocLocale, value: string) => void;
  readonly onCancel: () => void;
}

/** Строка сверки: машинный ключ + флаги слева, ячейки RU/EN справа. */
export function LocTableRow({
  row,
  edits,
  editingLocale,
  ruLabels,
  enLabels,
  flagLabels,
  onEdit,
  onCommit,
  onCancel,
}: LocTableRowProps) {
  const value = effective(row, edits);
  const changed = isChanged(row, edits);
  const missing = isMissingEn(value);
  const same = isSameAsRu(value);
  const edited = edits[row.id];
  const pendingRu = edited !== undefined && edited.ru !== row.ru;
  const pendingEn = edited !== undefined && edited.en !== row.en;

  return (
    <div className={styles.row}>
      <div className={styles.keyCell}>
        <code className={styles.key}>{row.label}</code>
        {missing ? (
          <span className={`${styles.flag} ${styles.flagMissing}`}>{flagLabels.missing}</span>
        ) : null}
        {same ? (
          <span className={`${styles.flag} ${styles.flagSame}`}>{flagLabels.same}</span>
        ) : null}
        {changed ? (
          <span className={`${styles.flag} ${styles.flagChanged}`}>{flagLabels.changed}</span>
        ) : null}
      </div>
      <div className={styles.localeCells}>
        <LocCell
          locale="ru"
          value={value.ru}
          editing={editingLocale === 'ru'}
          pending={pendingRu}
          labels={ruLabels}
          onEdit={() => onEdit('ru')}
          onCommit={(next) => onCommit('ru', next)}
          onCancel={onCancel}
        />
        <LocCell
          locale="en"
          value={value.en}
          editing={editingLocale === 'en'}
          pending={pendingEn}
          labels={enLabels}
          onEdit={() => onEdit('en')}
          onCommit={(next) => onCommit('en', next)}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}

import { useTranslation } from 'react-i18next';

import { SaveBar } from '@/shared/ui';
import { Icon } from '@sutuzhko/ui-kit';

import type { LocEdits, LocFilter, LocGroup, LocStats } from '../model/loc-rows';

import type { LocCellLabels, LocLocale } from './loc-cell';
import { LocTableRow } from './loc-table-row';
import styles from './admin-localization.module.css';

/** Редактируемая ячейка: строка + локаль (или null — ничего не правится). */
export interface LocEditing {
  readonly rowId: string;
  readonly locale: LocLocale;
}

export interface AdminLocalizationViewProps {
  readonly stats: LocStats;
  readonly groups: readonly LocGroup[];
  readonly edits: LocEdits;
  readonly editing: LocEditing | null;
  readonly query: string;
  readonly filter: LocFilter;
  readonly changedCount: number;
  readonly isSaving: boolean;
  readonly onQueryChange: (query: string) => void;
  readonly onFilterChange: (filter: LocFilter) => void;
  readonly onEditCell: (rowId: string, locale: LocLocale) => void;
  readonly onCommitCell: (rowId: string, locale: LocLocale, value: string) => void;
  readonly onCancelCell: () => void;
  readonly onSaveAll: () => void;
  readonly onDiscardAll: () => void;
}

const FILTERS: readonly { readonly value: LocFilter; readonly labelKey: string }[] = [
  { value: 'all', labelKey: 'admin.locale.filters.all' },
  { value: 'problems', labelKey: 'admin.locale.filters.problems' },
  { value: 'missing', labelKey: 'admin.locale.filters.missing' },
  { value: 'sameRu', labelKey: 'admin.locale.filters.same' },
  { value: 'changed', labelKey: 'admin.locale.filters.changed' },
];

/**
 * Презентационный вид вкладки «Локализация»: покрытие + статистика, поиск/фильтры,
 * таблица сверки RU/EN по секциям и плавающая панель сохранения диффа. Данные и
 * колбэки — пропами; логика диффа/фан-аута живёт в контейнере.
 */
export function AdminLocalizationView({
  stats,
  groups,
  edits,
  editing,
  query,
  filter,
  changedCount,
  isSaving,
  onQueryChange,
  onFilterChange,
  onEditCell,
  onCommitCell,
  onCancelCell,
  onSaveAll,
  onDiscardAll,
}: AdminLocalizationViewProps) {
  const { t } = useTranslation();

  const cellLabels = (locale: LocLocale): LocCellLabels => ({
    edit: t('admin.locale.cell.edit', { locale: locale.toUpperCase() }),
    done: t('admin.locale.cell.done'),
    cancel: t('admin.locale.cell.cancel'),
    hint: t('admin.locale.cell.hint'),
    missing: t('admin.locale.cell.missing'),
    pending: t('admin.locale.cell.pending'),
  });
  const ruLabels = cellLabels('ru');
  const enLabels = cellLabels('en');
  const flagLabels = {
    missing: t('admin.locale.flags.missing'),
    same: t('admin.locale.flags.same'),
    changed: t('admin.locale.flags.changed'),
  };

  return (
    <div className={styles.root}>
      <section className={styles.summary}>
        <div className={styles.summaryHead}>
          <div>
            <h3 className={styles.summaryTitle}>{t('admin.locale.title')}</h3>
            <p className={styles.summarySub}>{t('admin.locale.subtitle')}</p>
          </div>
          <div className={styles.coverage}>
            <div className={styles.coverageValue}>{stats.coverage}%</div>
            <div className={styles.coverageLabel}>{t('admin.locale.coverage')}</div>
          </div>
        </div>
        <div className={styles.stats}>
          <span className={styles.stat}>
            <span className={`${styles.dot} ${styles.dotOk}`} />
            {stats.translated} <span className={styles.statMuted}>{t('admin.locale.stat.ok')}</span>
          </span>
          <span className={styles.stat}>
            <span className={`${styles.dot} ${styles.dotMissing}`} />
            {stats.missingEn}{' '}
            <span className={styles.statMuted}>{t('admin.locale.stat.missing')}</span>
          </span>
          <span className={styles.stat}>
            <span className={`${styles.dot} ${styles.dotSame}`} />
            {stats.sameAsRu} <span className={styles.statMuted}>{t('admin.locale.stat.same')}</span>
          </span>
          <span className={`${styles.stat} ${styles.statMuted}`}>
            {t('admin.locale.stat.total', { count: stats.total })}
          </span>
        </div>
      </section>

      <div className={styles.controls}>
        <div className={styles.search}>
          <Icon name="search" size={15} className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            value={query}
            placeholder={t('admin.locale.searchPlaceholder')}
            aria-label={t('admin.locale.searchPlaceholder')}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
        <div className={styles.filters}>
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`${styles.filter} ${filter === item.value ? styles.filterActive : ''}`}
              aria-pressed={filter === item.value}
              onClick={() => onFilterChange(item.value)}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHead}>
          <div>{t('admin.locale.col.key')}</div>
          <div className={styles.headLocales}>
            <div>
              <span className={styles.ruMark}>RU</span> · {t('admin.locale.col.ru')}
            </div>
            <div>
              <span className={styles.enMark}>EN</span> · {t('admin.locale.col.en')}
            </div>
          </div>
        </div>

        {groups.map((group) => (
          <div key={group.id}>
            <div className={styles.groupHead}>
              <span className={styles.groupName}>{group.label}</span>
              <span className={styles.groupCount}>{group.rows.length}</span>
            </div>
            <div className={styles.groupRows}>
              {group.rows.map((row) => (
                <LocTableRow
                  key={row.id}
                  row={row}
                  edits={edits}
                  editingLocale={editing?.rowId === row.id ? editing.locale : null}
                  ruLabels={ruLabels}
                  enLabels={enLabels}
                  flagLabels={flagLabels}
                  onEdit={(locale) => onEditCell(row.id, locale)}
                  onCommit={(locale, next) => onCommitCell(row.id, locale, next)}
                  onCancel={onCancelCell}
                />
              ))}
            </div>
          </div>
        ))}

        {groups.length === 0 ? <div className={styles.empty}>{t('admin.locale.empty')}</div> : null}
      </div>

      <div className={styles.note}>
        <span className={styles.noteIcon}>
          <Icon name="file" size={17} />
        </span>
        <div>
          <p className={styles.noteTitle}>{t('admin.locale.note.title')}</p>
          <p className={styles.noteText}>{t('admin.locale.note.text')}</p>
        </div>
      </div>

      <SaveBar
        visible={changedCount > 0}
        isSaving={isSaving}
        count={changedCount}
        onSave={onSaveAll}
        onCancel={onDiscardAll}
      />
    </div>
  );
}

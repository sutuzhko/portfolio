import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { EducationType } from '@/entities/education';
import { SaveBar } from '@/shared/ui';
import { Icon, Input } from '@sutuzhko/ui-kit';

import { emptyRow, hasRowErrors, validateRow, type EducationRow } from '../model/education-form';

import { EducationPeriod } from './education-period';
import styles from './admin-education.module.css';

// Секции вкладки по типу записи (порядок и подписи — из макета).
const SECTIONS: readonly { type: EducationType; titleKey: string; addKey: string }[] = [
  { type: 'MAIN', titleKey: 'admin.education.mainTitle', addKey: 'admin.education.addMain' },
  {
    type: 'ADDITIONAL',
    titleKey: 'admin.education.extraTitle',
    addKey: 'admin.education.addExtra',
  },
];

export interface AdminEducationViewProps {
  readonly rows: readonly EducationRow[];
  /** Идёт сохранение — блокируем действия. */
  readonly isBusy: boolean;
  /** Сохранение: текущие строки + id удалённых записей (диф считает контейнер). */
  readonly onSave: (rows: readonly EducationRow[], deletedIds: readonly string[]) => void;
}

/**
 * Вкладка «Образование»: всегда редактируемые карточки по двум секциям (высшее /
 * курсы) + пакетное «Сохранить». Локализованные поля правятся в активной локали,
 * период — два поля-месяца; контейнер по разнице строк шлёт create/update/delete.
 * Презентационная.
 */
export function AdminEducationView({ rows: initialRows, isBusy, onSave }: AdminEducationViewProps) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<EducationRow[]>(() => [...initialRows]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  const patchRow = (key: string, patch: Partial<EducationRow>): void =>
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const addRow = (type: EducationType): void => setRows((prev) => [...prev, emptyRow(type)]);

  const removeRow = (row: EducationRow): void => {
    const { id } = row;
    setRows((prev) => prev.filter((item) => item.key !== row.key));
    if (id !== null) setDeletedIds((prev) => [...prev, id]);
  };

  // Отмена: вернуть строки к загруженным и забыть удаления.
  const cancel = (): void => {
    setRows([...initialRows]);
    setDeletedIds([]);
  };

  // Счётчик правок (для бара «N в диффе»): удаления + новые строки + изменённые.
  // Строка, отредактированная обратно к исходному значению, не считается.
  const initialById = useMemo(
    () => new Map(initialRows.map((row) => [row.id, row])),
    [initialRows],
  );
  const changeCount =
    deletedIds.length +
    rows.reduce((count, row) => {
      // Новая строка считается изменением только с заполненным названием (иначе
      // create не уйдёт — как в контейнере), чтобы «N в диффе» = числу запросов.
      if (row.id === null) return row.degree.trim() !== '' ? count + 1 : count;
      const initial = initialById.get(row.id);
      if (initial === undefined) return count;
      const changed =
        initial.type !== row.type ||
        initial.degree !== row.degree ||
        initial.place !== row.place ||
        initial.startMonth !== row.startMonth ||
        initial.endMonth !== row.endMonth;
      return changed ? count + 1 : count;
    }, 0);
  // Сохранять можно, только когда у всех уходящих строк корректный период.
  const canSave = rows.every((row) => !hasRowErrors(row));

  const renderPeriod = (row: EducationRow) => (
    <EducationPeriod
      startMonth={row.startMonth}
      endMonth={row.endMonth}
      errors={validateRow(row)}
      onChange={(patch) => patchRow(row.key, patch)}
    />
  );

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>{t('admin.tabs.education')}</h2>
          <span className={styles.endpoint}>GET · POST · PATCH · DELETE /api/education</span>
        </div>
      </header>

      {SECTIONS.map((section) => {
        const sectionRows = rows.filter((row) => row.type === section.type);
        const isMain = section.type === 'MAIN';

        return (
          <div key={section.type} className={styles.section}>
            <div className={styles.sectionHead}>
              <h3 className={styles.sectionTitle}>{t(section.titleKey)}</h3>
              <button type="button" className={styles.addBtn} onClick={() => addRow(section.type)}>
                + {t(section.addKey)}
              </button>
            </div>

            <div className={styles.rows}>
              {sectionRows.length === 0 ? (
                <p className={styles.empty}>{t('admin.education.empty')}</p>
              ) : null}

              {sectionRows.map((row) =>
                isMain ? (
                  <div key={row.key} className={styles.entryCard}>
                    <div className={styles.entryTop}>
                      <div className={styles.grow}>
                        <Input
                          aria-label={t('admin.education.degree')}
                          placeholder={t('admin.education.degreePlaceholder')}
                          value={row.degree}
                          onChange={(event) => patchRow(row.key, { degree: event.target.value })}
                          font="sans"
                        />
                      </div>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        aria-label={t('admin.education.delete')}
                        onClick={() => removeRow(row)}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                    <div className={styles.entryBottom}>
                      <div className={styles.grow}>
                        <Input
                          aria-label={t('admin.education.place')}
                          placeholder={t('admin.education.placePlaceholder')}
                          value={row.place}
                          onChange={(event) => patchRow(row.key, { place: event.target.value })}
                          font="sans"
                          className={styles.placeInput}
                        />
                      </div>
                      {renderPeriod(row)}
                    </div>
                  </div>
                ) : (
                  <div key={row.key} className={styles.courseRow}>
                    <div className={styles.grow}>
                      <Input
                        aria-label={t('admin.education.degree')}
                        placeholder={t('admin.education.coursePlaceholder')}
                        value={row.degree}
                        onChange={(event) => patchRow(row.key, { degree: event.target.value })}
                        font="sans"
                      />
                    </div>
                    {renderPeriod(row)}
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      aria-label={t('admin.education.delete')}
                      onClick={() => removeRow(row)}
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
        );
      })}

      <SaveBar
        visible={changeCount > 0}
        isSaving={isBusy}
        canSave={canSave}
        count={changeCount}
        onSave={() => onSave(rows, deletedIds)}
        onCancel={cancel}
      />
    </section>
  );
}

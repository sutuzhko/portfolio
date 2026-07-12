import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ExperienceAdmin } from '@/entities/experience';
import type { AppLanguage } from '@/shared/config';
import { Button, ConfirmDialog, Icon } from '@sutuzhko/ui-kit';

import { pickText } from '../model/experience-form';

import styles from './admin-experience.module.css';

export interface AdminExperienceViewProps {
  readonly items: readonly ExperienceAdmin[];
  /** Активная локаль приложения — для показа роли в списке. */
  readonly locale: AppLanguage;
  /** Идёт мутация — блокируем действия. */
  readonly isBusy: boolean;
  readonly onAdd: () => void;
  readonly onEdit: (id: string) => void;
  readonly onDelete: (id: string) => void;
}

// ISO date-time → MM/YYYY (как в макете «06/2025»).
function formatMonth(iso: string): string {
  const ym = iso.slice(0, 7); // YYYY-MM
  return `${ym.slice(5, 7)}/${ym.slice(0, 4)}`;
}

function formatPeriod(record: ExperienceAdmin, presentLabel: string): string {
  const start = formatMonth(record.startDate);
  if (record.current) return `${start} — ${presentLabel}`;
  return record.endDate ? `${start} — ${formatMonth(record.endDate)}` : start;
}

/**
 * Список мест работы: компания, роль, период, значок «сейчас». Добавление и
 * редактирование ведут на отдельные детальные маршруты (форма — не здесь),
 * удаление — с подтверждением. Презентационная.
 */
export function AdminExperienceView({
  items,
  locale,
  isBusy,
  onAdd,
  onEdit,
  onDelete,
}: AdminExperienceViewProps) {
  const { t } = useTranslation();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>{t('admin.tabs.experience')}</h2>
          <span className={styles.endpoint}>GET · POST · PATCH · DELETE /api/experience</span>
        </div>
        <Button variant="primary" onClick={onAdd} disabled={isBusy}>
          <Icon name="plus" size={14} />
          {t('admin.experience.add')}
        </Button>
      </header>

      <ul className={styles.list}>
        {items.length === 0 ? (
          <li className={styles.empty}>{t('admin.experience.empty')}</li>
        ) : null}

        {items.map((item) => (
          <li key={item.id} className={styles.row}>
            <div className={styles.rowText}>
              <div className={styles.rowTitle}>
                <span className={styles.company}>{item.company}</span>
                {item.current ? (
                  <span className={styles.badge}>{t('admin.experience.now')}</span>
                ) : null}
              </div>
              <span className={styles.role}>{pickText(item.role, locale)}</span>
            </div>
            <span className={styles.periodTag}>
              {formatPeriod(item, t('admin.experience.present'))}
            </span>
            <div className={styles.actions}>
              <Button
                variant="icon"
                onClick={() => onEdit(item.id)}
                aria-label={t('admin.experience.edit')}
              >
                <Icon name="edit" size={15} />
              </Button>
              <Button
                variant="icon"
                onClick={() => setConfirmId(item.id)}
                aria-label={t('admin.experience.delete')}
              >
                <Icon name="trash" size={15} />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={confirmId !== null}
        title={t('admin.experience.confirmTitle')}
        message={t('admin.experience.confirmDelete', {
          name: items.find((item) => item.id === confirmId)?.company ?? '',
        })}
        confirmLabel={t('admin.experience.delete')}
        cancelLabel={t('admin.experience.cancel')}
        busy={isBusy}
        onConfirm={() => {
          if (confirmId !== null) onDelete(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </section>
  );
}

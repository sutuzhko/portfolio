import { useTranslation } from 'react-i18next';

import { Input } from '@sutuzhko/ui-kit';

import type { EducationRow, EducationRowErrors } from '../model/education-form';

import styles from './admin-education.module.css';

type PeriodPatch = Partial<Pick<EducationRow, 'startMonth' | 'endMonth'>>;

interface EducationPeriodProps {
  readonly startMonth: string;
  readonly endMonth: string;
  readonly errors: EducationRowErrors;
  readonly onChange: (patch: PeriodPatch) => void;
}

/**
 * Период записи — два поля-месяца «начало — окончание». Начало обязательно (по нему
 * сортируется таймлайн), окончание можно не указывать (курс одной датой).
 */
export function EducationPeriod({ startMonth, endMonth, errors, onChange }: EducationPeriodProps) {
  const { t } = useTranslation();

  return (
    <div role="group" aria-label={t('admin.education.period')} className={styles.period}>
      <div className={styles.periodCell}>
        <Input
          type="month"
          aria-label={t('admin.education.startDate')}
          required
          value={startMonth}
          error={errors.startMonth ? t(errors.startMonth) : undefined}
          onChange={(event) => onChange({ startMonth: event.target.value })}
        />
      </div>
      <span className={styles.periodDash} aria-hidden="true" />
      <div className={styles.periodCell}>
        <Input
          type="month"
          aria-label={t('admin.education.endDate')}
          value={endMonth}
          error={errors.endMonth ? t(errors.endMonth) : undefined}
          onChange={(event) => onChange({ endMonth: event.target.value })}
        />
      </div>
    </div>
  );
}

import { useTranslation } from 'react-i18next';

import type { Education } from '@/entities/education';
import { Skeleton } from '@sutuzhko/ui-kit';

import styles from './resume-details.module.css';

interface EducationCardProps {
  readonly education?: readonly Education[];
  readonly isLoading?: boolean;
}

/** Карточка образования: основное (`MAIN`) и дополнительное (`ADDITIONAL`). */
export function EducationCard({ education, isLoading }: EducationCardProps) {
  const { t } = useTranslation();

  if (isLoading || !education) {
    return (
      <div className={styles.card}>
        <Skeleton height="190px" />
      </div>
    );
  }

  const main = education.filter((item) => item.type === 'MAIN');
  const additional = education.filter((item) => item.type === 'ADDITIONAL');

  return (
    <div className={styles.card}>
      <p className={styles.label}>{t('experience.education')}</p>
      <EducationList items={main} />
      {additional.length > 0 ? (
        <>
          <p className={styles.labelGap}>{t('experience.additional')}</p>
          <EducationList items={additional} />
        </>
      ) : null}
    </div>
  );
}

function EducationList({ items }: { readonly items: readonly Education[] }) {
  return (
    <div className={styles.eduList}>
      {items.map((item) => (
        <div key={item.id}>
          <div className={styles.eduDegree}>{item.degree}</div>
          {item.place !== null ? <div className={styles.eduPlace}>{item.place}</div> : null}
          {item.period !== null ? <div className={styles.eduPeriod}>{item.period}</div> : null}
        </div>
      ))}
    </div>
  );
}

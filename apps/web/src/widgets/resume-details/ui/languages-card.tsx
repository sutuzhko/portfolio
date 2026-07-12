import { useTranslation } from 'react-i18next';

import type { Language } from '@/entities/language';
import { Skeleton } from '@sutuzhko/ui-kit';

import styles from './resume-details.module.css';

interface LanguagesCardProps {
  readonly languages?: readonly Language[];
  readonly isLoading?: boolean;
}

/** Карточка языков: название, уровень и полоса владения (`pct`). */
export function LanguagesCard({ languages, isLoading }: LanguagesCardProps) {
  const { t } = useTranslation();

  if (isLoading || !languages) {
    return (
      <div className={styles.card}>
        <Skeleton height="120px" />
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <p className={styles.label}>{t('experience.languages')}</p>
      <div className={styles.langList}>
        {languages.map((language) => (
          <div key={language.id}>
            <div className={styles.langHead}>
              <span>{language.name}</span>
              <span className={styles.langLevel}>{language.level}</span>
            </div>
            <div className={styles.langTrack}>
              <div className={styles.langFill} style={{ width: `${String(language.pct)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

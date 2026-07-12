import { Card, Skeleton } from '@sutuzhko/ui-kit';

import styles from './activity.module.css';

/** Скелетон карточки статистики: держит раскладку, пока данные грузятся. */
export function StatCardSkeleton() {
  return (
    <Card className={styles.card} aria-busy="true" aria-live="polite">
      <div className={styles.header}>
        <div className={styles.brand}>
          <Skeleton width="36px" height="36px" radius="var(--radius-card)" />
          <div className={styles.brandText}>
            <Skeleton width="80px" height="18px" />
            <Skeleton width="120px" height="14px" />
          </div>
        </div>
        <Skeleton width="90px" height="28px" radius="var(--radius-stadium)" />
      </div>
      <div className={styles.stats}>
        {[0, 1, 2].map((index) => (
          <div key={index} className={styles.stat}>
            <Skeleton width="48px" height="22px" />
            <Skeleton width="64px" height="13px" />
          </div>
        ))}
      </div>
      <Skeleton width="60%" height="34px" />
    </Card>
  );
}

import { Skeleton } from '@sutuzhko/ui-kit';

import styles from './admin-experience.module.css';

const ROWS = [0, 1, 2];

/** Скелетон списка опыта на время загрузки. */
export function AdminExperienceSkeleton() {
  return (
    <div className={styles.card} aria-busy="true" aria-live="polite">
      <header className={styles.head}>
        <Skeleton width="160px" height="22px" />
        <Skeleton width="120px" height="34px" radius="var(--radius-button)" />
      </header>
      <ul className={styles.list}>
        {ROWS.map((row) => (
          <li key={row} className={styles.row}>
            <div className={styles.rowText}>
              <Skeleton width="180px" height="20px" />
              <Skeleton width="140px" height="16px" />
            </div>
            <Skeleton width="90px" height="16px" />
          </li>
        ))}
      </ul>
    </div>
  );
}

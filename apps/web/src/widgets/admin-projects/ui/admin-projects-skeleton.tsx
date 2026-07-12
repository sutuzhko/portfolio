import { Skeleton } from '@sutuzhko/ui-kit';

import styles from './admin-projects.module.css';

const ROWS = [0, 1, 2, 3];

/** Скелетон списка проектов на время загрузки. */
export function AdminProjectsSkeleton() {
  return (
    <div className={styles.card} aria-busy="true" aria-live="polite">
      <header className={styles.head}>
        <Skeleton width="140px" height="22px" />
        <Skeleton width="140px" height="34px" radius="var(--radius-button)" />
      </header>
      <ul className={styles.list}>
        {ROWS.map((row) => (
          <li key={row} className={styles.row}>
            <Skeleton width="34px" height="34px" radius="9px" />
            <div className={styles.rowText}>
              <Skeleton width="180px" height="20px" />
              <Skeleton width="120px" height="14px" />
            </div>
            <Skeleton width="80px" height="14px" />
          </li>
        ))}
      </ul>
    </div>
  );
}

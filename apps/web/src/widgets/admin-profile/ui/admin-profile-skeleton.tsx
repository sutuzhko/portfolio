import { Skeleton } from '@sutuzhko/ui-kit';

import styles from './admin-profile.module.css';

const ROWS = [0, 1, 2, 3, 4, 5];

/** Скелетон формы профиля на время загрузки. */
export function AdminProfileSkeleton() {
  return (
    <div className={styles.form} aria-busy="true" aria-live="polite">
      <header className={styles.head}>
        <Skeleton width="140px" height="22px" />
        <Skeleton width="110px" height="36px" radius="var(--radius-button)" />
      </header>
      <div className={styles.body}>
        {ROWS.map((row) => (
          <div key={row} className={styles.skeletonField}>
            <Skeleton width="30%" height="14px" />
            <Skeleton width="100%" height="40px" radius="var(--radius-sm)" />
          </div>
        ))}
      </div>
    </div>
  );
}

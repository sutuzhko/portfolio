import { Skeleton } from '@sutuzhko/ui-kit';

import styles from './admin-settings.module.css';

const ROWS = [0, 1, 2, 3];

/** Скелетон формы настроек на время загрузки. */
export function AdminSettingsSkeleton() {
  return (
    <div className={styles.form} aria-busy="true" aria-live="polite">
      <header className={styles.head}>
        <Skeleton width="140px" height="22px" />
        <Skeleton width="110px" height="36px" radius="var(--radius-button)" />
      </header>
      <div className={styles.body}>
        {ROWS.map((row) => (
          <div key={row} className={styles.field}>
            <Skeleton width="30%" height="14px" />
            <Skeleton width="220px" height="34px" radius="var(--radius-button)" />
          </div>
        ))}
      </div>
    </div>
  );
}

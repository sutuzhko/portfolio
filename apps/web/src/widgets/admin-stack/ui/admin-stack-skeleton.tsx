import { Skeleton } from '@sutuzhko/ui-kit';

import styles from './admin-stack.module.css';

const COLUMNS = [0, 1, 2];

/** Скелетон вкладки «Стек и языки»: сетка технологий + строки языков. */
export function AdminStackSkeleton() {
  return (
    <div className={styles.card} aria-busy="true" aria-live="polite">
      <header className={styles.head}>
        <Skeleton width="140px" height="22px" />
        <Skeleton width="110px" height="36px" radius="9px" />
      </header>
      <div className={styles.body}>
        <Skeleton width="120px" height="14px" />
        <div className={styles.techGrid}>
          {COLUMNS.map((column) => (
            <div key={column} className={styles.techColumn}>
              <Skeleton width="60%" height="12px" />
              <Skeleton width="100%" height="60px" radius="9px" />
            </div>
          ))}
        </div>
        <Skeleton width="100%" height="40px" radius="9px" />
      </div>
    </div>
  );
}

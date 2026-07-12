import { Skeleton } from '@sutuzhko/ui-kit';

import styles from './admin-kb.module.css';

const ROWS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

/** Скелетон вкладки БЗ: колонка библиотеки + правая панель, пока грузится дерево. */
export function AdminKbSkeleton() {
  return (
    <div className={styles.grid} aria-hidden="true">
      <aside className={styles.library}>
        <div className={styles.libraryHead}>
          <Skeleton className={styles.skelHeadTitle} />
        </div>
        <div className={styles.tree}>
          {ROWS.map((key) => (
            <Skeleton key={key} className={styles.skelRow} />
          ))}
        </div>
      </aside>
      <div className={styles.rightPane}>
        <div className={styles.viewerBody}>
          <Skeleton className={styles.skelTitle} />
          <Skeleton className={styles.skelLine} />
          <Skeleton className={styles.skelLine} />
          <Skeleton className={styles.skelShort} />
        </div>
      </div>
    </div>
  );
}

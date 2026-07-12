import { Skeleton } from '@sutuzhko/ui-kit';

import styles from './admin-localization.module.css';

/** Скелетон вкладки «Локализация»: шапка, строка управления, таблица. */
export function AdminLocalizationSkeleton() {
  return (
    <div className={styles.root} aria-busy="true">
      <Skeleton className={styles.skelSummary} />
      <Skeleton className={styles.skelControls} />
      <Skeleton className={styles.skelTable} />
    </div>
  );
}

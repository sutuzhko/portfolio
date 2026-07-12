import { Skeleton } from '@sutuzhko/ui-kit';

import styles from './kb-tree.module.css';

const ROWS = [0, 1, 2, 3, 4, 5];

/** Скелетон дерева БЗ на время загрузки. */
export function KbTreeSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      {ROWS.map((row) => (
        <Skeleton key={row} height="18px" width={row % 3 === 0 ? '70%' : '85%'} />
      ))}
    </div>
  );
}

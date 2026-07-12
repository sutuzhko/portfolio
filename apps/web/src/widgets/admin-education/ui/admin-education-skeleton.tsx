import { Skeleton } from '@sutuzhko/ui-kit';

import styles from './admin-education.module.css';

const SECTIONS = [
  { key: 'main', rows: [0, 1] },
  { key: 'extra', rows: [0] },
];

/** Скелетон вкладки образования на время загрузки. */
export function AdminEducationSkeleton() {
  return (
    <div className={styles.card} aria-busy="true" aria-live="polite">
      <header className={styles.head}>
        <Skeleton width="160px" height="22px" />
        <Skeleton width="120px" height="34px" radius="var(--radius-button)" />
      </header>
      {SECTIONS.map((section) => (
        <div key={section.key} className={styles.section}>
          <div className={styles.sectionHead}>
            <Skeleton width="180px" height="18px" />
            <Skeleton width="90px" height="30px" radius="var(--radius-sm)" />
          </div>
          <div className={styles.rows}>
            {section.rows.map((row) => (
              <Skeleton key={row} height="88px" radius="var(--radius-button)" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

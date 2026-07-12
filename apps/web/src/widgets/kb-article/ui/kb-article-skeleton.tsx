import { Skeleton } from '@sutuzhko/ui-kit';

import styles from './kb-article.module.css';

const PARAGRAPHS = [
  ['100%', '94%', '88%'],
  ['100%', '70%'],
];

/** Скелетон статьи на время загрузки тела. */
export function KbArticleSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-live="polite">
      <div className={styles.skeletonHead}>
        <Skeleton width="40%" height="14px" />
        <div className={styles.skeletonTags}>
          <Skeleton width="52px" height="16px" radius="var(--radius-sm)" />
          <Skeleton width="64px" height="16px" radius="var(--radius-sm)" />
        </div>
      </div>
      <div className={styles.skeletonBody}>
        <Skeleton width="60%" height="24px" />
        {PARAGRAPHS.map((lines, index) => (
          <div key={index} className={styles.skeletonParagraph}>
            {lines.map((width, line) => (
              <Skeleton key={line} width={width} height="16px" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

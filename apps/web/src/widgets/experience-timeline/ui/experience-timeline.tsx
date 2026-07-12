import type { Experience } from '@/entities/experience';
import { Skeleton } from '@sutuzhko/ui-kit';

import { ExperienceItem } from './experience-item';
import styles from './experience-timeline.module.css';

const SKELETON_COUNT = 2;

export interface ExperienceTimelineProps {
  readonly jobs?: readonly Experience[];
  readonly isLoading?: boolean;
}

/**
 * Таймлайн опыта работы (макет: EXPERIENCE → TIMELINE) — вертикальная линия с
 * точками-маркерами и карточками мест работы. Презентационен: список приходит
 * пропсом, пока грузится — скелетоны той же раскладки.
 */
export function ExperienceTimeline({ jobs, isLoading }: ExperienceTimelineProps) {
  if (isLoading || !jobs) {
    return (
      <div className={styles.timeline} aria-busy="true" aria-live="polite">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <div key={index} className={styles.item}>
            <span className={styles.line} aria-hidden="true" />
            <span className={styles.dot} aria-hidden="true" />
            <Skeleton height="150px" radius="var(--radius-panel)" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.timeline}>
      {jobs.map((job) => (
        <ExperienceItem key={job.id} job={job} />
      ))}
    </div>
  );
}

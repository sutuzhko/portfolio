import { useTranslation } from 'react-i18next';

import type { Experience } from '@/entities/experience';
import { useAppLanguage } from '@/shared/config';

import { formatPeriod } from '../model/format-period';

import styles from './experience-timeline.module.css';

interface ExperienceItemProps {
  readonly job: Experience;
}

/** Одна запись таймлайна: точка-маркер и карточка (роль/компания/период, буллеты, стек). */
export function ExperienceItem({ job }: ExperienceItemProps) {
  const { t } = useTranslation();
  const language = useAppLanguage();
  const period = formatPeriod(
    job.startDate,
    job.endDate,
    job.current,
    language,
    t('experience.present'),
  );

  return (
    <div className={styles.item}>
      <span className={styles.line} aria-hidden="true" />
      <span
        className={styles.dot}
        style={{ background: job.dotColor ?? 'var(--color-primary-bright)' }}
        aria-hidden="true"
      />
      <div className={styles.card}>
        <div className={styles.head}>
          <h3 className={styles.role}>{job.role}</h3>
          <span className={styles.company}>{job.company}</span>
          <span className={styles.period}>{period}</span>
        </div>
        {job.location !== null || job.sub !== null ? (
          <div className={styles.meta}>
            {job.location !== null ? <span>📍 {job.location}</span> : null}
            {job.sub !== null ? <span className={styles.sub}>{job.sub}</span> : null}
          </div>
        ) : null}
        <ul className={styles.bullets}>
          {job.bullets.map((bullet) => (
            <li key={bullet} className={styles.bullet}>
              <span className={styles.bulletDot} aria-hidden="true" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        {job.technologies.length > 0 ? (
          <div className={styles.tech}>
            {job.technologies.map((tech) => (
              <span key={tech} className={styles.techTag}>
                {tech}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

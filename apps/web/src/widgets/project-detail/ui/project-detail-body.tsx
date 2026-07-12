import { useTranslation } from 'react-i18next';

import type { ProjectMedia } from '@/entities/project';
import { Markdown } from '@/shared/ui';

import styles from './project-detail.module.css';

interface ProjectDetailBodyProps {
  readonly bodyMarkdown: string;
  readonly bullets: readonly string[];
  readonly gallery: readonly ProjectMedia[];
}

/** Основная колонка детали: описание (Markdown), список «что внутри» и галерея. */
export function ProjectDetailBody({ bodyMarkdown, bullets, gallery }: ProjectDetailBodyProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.body}>
      <Markdown>{bodyMarkdown}</Markdown>

      {bullets.length > 0 ? (
        <div>
          <p className={styles.sectionLabel}>{t('project.whatsInside')}</p>
          <ul className={styles.bulletList}>
            {bullets.map((bullet) => (
              <li key={bullet} className={styles.bullet}>
                <span className={styles.bulletDot} aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {gallery.length > 0 ? (
        <div className={styles.gallery}>
          {gallery.map((media) => (
            <img
              key={media.url}
              className={styles.shot}
              src={media.url}
              alt={media.alt ?? ''}
              loading="lazy"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

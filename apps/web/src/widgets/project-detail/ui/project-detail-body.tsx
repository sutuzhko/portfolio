import { useTranslation } from 'react-i18next';
import Markdown, { type Components } from 'react-markdown';

import type { ProjectMedia } from '@/entities/project';

import styles from './project-detail.module.css';

// Ссылки в описании ведут на внешние ресурсы — открываем в новой вкладке
// безопасно; `children` пробрасываем явно (иначе jsx-a11y/anchor-has-content).
const markdownComponents: Components = {
  a: ({ node: _node, children, ...props }) => (
    <a {...props} className={styles.proseLink} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

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
      <div className={styles.prose}>
        <Markdown components={markdownComponents}>{bodyMarkdown}</Markdown>
      </div>

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

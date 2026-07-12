import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';

import styles from './project-tile.module.css';

const MAX_TAGS = 3;

interface ProjectTagsProps {
  readonly tags: readonly string[];
}

/** Ряд технологий карточки: первые несколько + счётчик «+N» остатка. */
export function ProjectTags({ tags }: ProjectTagsProps) {
  const { t } = useTranslation();
  const shown = tags.slice(0, MAX_TAGS);
  const extra = tags.length - shown.length;

  return (
    <span className={styles.tags}>
      {shown.map((tag) => (
        <span key={tag} className={styles.tag}>
          {tag}
        </span>
      ))}
      {extra > 0 ? (
        <span className={cn(styles.tag, styles.tagMore)}>
          {t('projects.card.extra', { count: extra })}
        </span>
      ) : null}
    </span>
  );
}

import { useTranslation } from 'react-i18next';

import type { ProjectListItem } from '@/entities/project';
import { cn } from '@/shared/lib';
import { SectionLabel } from '@sutuzhko/ui-kit';

import { ProjectTile, TileSkeleton } from './project-tile';
import styles from './featured.module.css';

const noop = () => undefined;

export interface FeaturedProps {
  /** Избранные (закреплённые) проекты. Пока грузятся — скелетоны. */
  readonly projects?: readonly ProjectListItem[];
  readonly isLoading?: boolean;
  /** Открыть проект по slug (экран детали — позже). */
  readonly onSelect?: (slug: string) => void;
  /** Перейти ко всем проектам (экран Projects — позже). */
  readonly onViewAll?: () => void;
  /** Якорь секции для навигации и скролл-шпиона. */
  readonly id?: string;
  readonly className?: string;
}

/**
 * Секция избранных проектов главной (макет: FEATURED PROJECTS) — плитки-градиенты
 * с категорией, названием, описанием, аватарами контрибьюторов и тегами.
 * Презентационна: список приходит пропсом (страница фильтрует закреплённые).
 */
export function Featured({
  projects,
  isLoading,
  onSelect = noop,
  onViewAll = noop,
  id,
  className,
}: FeaturedProps) {
  const { t } = useTranslation();

  return (
    <section id={id} className={cn(styles.section, className)}>
      <div className={styles.head}>
        <SectionLabel className={styles.label}>{t('home.sections.featured')}</SectionLabel>
        <button type="button" className={styles.allLink} onClick={onViewAll}>
          {t('home.featured.all')}
        </button>
      </div>
      <div className={styles.grid}>
        {isLoading || !projects ? (
          <>
            <TileSkeleton />
            <TileSkeleton />
          </>
        ) : (
          projects.map((project) => (
            <ProjectTile key={project.slug} project={project} onSelect={onSelect} />
          ))
        )}
      </div>
    </section>
  );
}

import { useTranslation } from 'react-i18next';

import type { ProjectListItem } from '@/entities/project';
import { Skeleton } from '@sutuzhko/ui-kit';

import { Contributors } from './contributors';
import { TagRow } from './tag-row';
import styles from './featured.module.css';

// Если описание состоит из нескольких предложений — показываем только первое
// (обрезаем сразу после точки), чтобы длинный текст не распирал плитку.
function firstSentence(text: string): string {
  const boundary = text.search(/[.!?]\s/);
  return boundary >= 0 ? text.slice(0, boundary + 1) : text;
}

interface ProjectTileProps {
  readonly project: ProjectListItem;
  readonly onSelect: (slug: string) => void;
}

/** Плитка-градиент избранного проекта: категория, название, первое предложение
 * описания, аватары контрибьюторов и адаптивный ряд тегов. Плитка — это `<button>`. */
export function ProjectTile({ project, onSelect }: ProjectTileProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className={styles.tile}
      style={{ background: project.tileColor ?? 'var(--color-raised)' }}
      onClick={() => onSelect(project.slug)}
    >
      <span className={styles.content}>
        {project.category ? (
          <span className={styles.category}>
            {t(`home.featured.categories.${project.category}`, project.category)}
          </span>
        ) : null}
        <span className={styles.title}>{project.title}</span>
        <span className={styles.description}>{firstSentence(project.description)}</span>
        <span className={styles.footer}>
          <Contributors people={project.contributors} />
          <TagRow tags={project.technologies} />
        </span>
      </span>
    </button>
  );
}

/** Скелетон плитки: держит высоту сетки, пока избранные проекты грузятся. */
export function TileSkeleton() {
  return <Skeleton className={styles.tileSkeleton} height="var(--featured-tile-height)" />;
}

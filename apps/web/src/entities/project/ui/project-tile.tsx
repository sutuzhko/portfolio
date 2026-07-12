import { Skeleton } from '@sutuzhko/ui-kit';

import type { ProjectListItem } from '../model/types';

import { ProjectAvatars } from './project-avatars';
import { ProjectBackground } from './project-background';
import { ProjectCategory } from './project-category';
import { ProjectTags } from './project-tags';
import styles from './project-tile.module.css';

/**
 * Что нужно плитке для отрисовки — подмножество `ProjectListItem` без `slug`.
 * Благодаря этому её можно кормить черновиком формы в кабинете, а не только ответом API.
 */
export type ProjectTileData = Pick<
  ProjectListItem,
  | 'title'
  | 'description'
  | 'category'
  | 'period'
  | 'tileColor'
  | 'runnable'
  | 'runCommand'
  | 'contributors'
  | 'technologies'
>;

interface ProjectTileProps {
  readonly project: ProjectTileData;
  /** Клик по плитке. Есть — плитка кликабельна (`button`), нет — статична (`div`). */
  readonly onOpen?: () => void;
}

/**
 * Визуал плитки проекта: фон-градиент (`ProjectBackground`), категория и период,
 * название, краткое описание, маркер запуска, аватары контрибьюторов и теги.
 *
 * Не знает, откуда данные: в публичном списке это ответ API, в кабинете — живой
 * черновик формы. Поэтому вёрстка карточки существует ровно в одном месте.
 * Содержимое — только phrasing-элементы (`span`), чтобы плитку можно было
 * обернуть в `<button>` без невалидной вложенности.
 */
export function ProjectTile({ project, onOpen }: ProjectTileProps) {
  const content = (
    <>
      <ProjectBackground color={project.tileColor} />
      <span className={styles.body}>
        <span className={styles.top}>
          {project.category ? <ProjectCategory category={project.category} /> : null}
          {project.period ? <span className={styles.year}>{project.period}</span> : null}
        </span>
        <span className={styles.title}>{project.title}</span>
        <span className={styles.subtitle}>{project.description}</span>
        {project.runnable && project.runCommand ? (
          <span className={styles.run}>
            <span aria-hidden="true">▶</span> {project.runCommand}
          </span>
        ) : null}
        <span className={styles.footer}>
          <ProjectAvatars people={project.contributors} />
          <ProjectTags tags={project.technologies} />
        </span>
      </span>
    </>
  );

  if (onOpen === undefined) {
    return <div className={styles.card}>{content}</div>;
  }

  return (
    <button type="button" className={styles.card} onClick={onOpen}>
      {content}
    </button>
  );
}

/** Скелетон плитки: держит место в сетке, пока проекты грузятся. */
export function ProjectTileSkeleton() {
  return <Skeleton className={styles.card} height="220px" radius="var(--radius-panel)" />;
}

import { useTranslation } from 'react-i18next';

import type { ProjectDetail as ProjectDetailData } from '@/entities/project';
import { Button, Skeleton } from '@sutuzhko/ui-kit';

import { ProjectDetailAside } from './project-detail-aside';
import { ProjectDetailBanner } from './project-detail-banner';
import { ProjectDetailBody } from './project-detail-body';
import styles from './project-detail.module.css';

export interface ProjectDetailProps {
  readonly project?: ProjectDetailData;
  readonly isLoading?: boolean;
  /** Запустить проект в раннере (кнопка «▶ Запустить»). Страница даёт обработчик. */
  readonly onRun?: () => void;
}

/**
 * Деталь проекта (макет: PROJECT DETAIL) — шапка-баннер, основная колонка
 * (описание, «что внутри», галерея) и боковая карточка (роль, период, стек,
 * ссылки). Запускаемый проект получает кнопку «▶ Запустить». Презентационна:
 * данные приходят пропсом (страница оркеструет запрос), пока грузятся — скелетон.
 */
export function ProjectDetail({ project, isLoading, onRun }: ProjectDetailProps) {
  const { t } = useTranslation();

  if (isLoading || !project) {
    return <ProjectDetailSkeleton />;
  }

  const canRun = project.runnable && project.embedUrl !== null && onRun !== undefined;

  return (
    <div className={styles.detail}>
      <ProjectDetailBanner
        title={project.title}
        subtitle={project.subtitle ?? project.description}
        color={project.tileColor}
      />
      {canRun ? (
        <div className={styles.runBar}>
          <Button variant="primary" onClick={onRun}>
            <span aria-hidden="true">▶</span> {t('project.run')}
          </Button>
          {project.runHint ? <span className={styles.runHint}>{project.runHint}</span> : null}
        </div>
      ) : null}
      <div className={styles.grid}>
        <ProjectDetailBody
          bodyMarkdown={project.bodyMarkdown}
          bullets={project.bullets}
          gallery={project.gallery}
        />
        <ProjectDetailAside
          role={project.role}
          period={project.period}
          technologies={project.technologies}
          contributors={project.contributors}
          links={project.links}
        />
      </div>
    </div>
  );
}

/** Скелетон детали: держит раскладку баннера и колонок, пока проект грузится. */
function ProjectDetailSkeleton() {
  return (
    <div className={styles.detail} aria-busy="true" aria-live="polite">
      <Skeleton height="200px" radius="var(--radius-panel)" />
      <div className={styles.grid}>
        <div className={styles.body}>
          <div className={styles.proseSkeleton}>
            <Skeleton width="100%" height="18px" />
            <Skeleton width="94%" height="18px" />
            <Skeleton width="68%" height="18px" />
          </div>
          <div className={styles.bulletSkeleton}>
            <Skeleton width="80%" height="15px" />
            <Skeleton width="72%" height="15px" />
            <Skeleton width="64%" height="15px" />
          </div>
        </div>
        <aside className={styles.aside}>
          <Skeleton height="220px" radius="var(--radius-panel)" />
        </aside>
      </div>
    </div>
  );
}

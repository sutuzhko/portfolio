import { useTranslation } from 'react-i18next';

import type { ProjectDetail } from '@/entities/project';
import { useReveal } from '@/shared/lib';
import { ErrorState, Icon } from '@sutuzhko/ui-kit';
import { ProjectDetail as ProjectDetailWidget } from '@/widgets/project-detail';

import styles from './project-page.module.css';

const noop = () => undefined;

export interface ProjectPageViewProps {
  readonly project?: ProjectDetail;
  readonly isLoading?: boolean;
  readonly isError?: boolean;
  readonly onBack?: () => void;
  readonly onRetry?: () => void;
  /** Запустить проект в раннере (для запускаемых проектов с embedUrl). */
  readonly onRun?: () => void;
}

/**
 * Презентационный слой детали проекта: кнопка «назад» и виджет детали. Данные и
 * `isLoading`/`isError` приходят пропсами — запрос и навигацию делает контейнер
 * `ProjectPage`. Состояние загрузки наглядно управляется в Storybook.
 */
export function ProjectPageView({
  project,
  isLoading,
  isError,
  onBack = noop,
  onRetry = noop,
  onRun,
}: ProjectPageViewProps) {
  const { t } = useTranslation();
  const revealRef = useReveal();

  return (
    <main id="main" className={styles.page} ref={revealRef}>
      <button type="button" className={styles.back} onClick={onBack}>
        <Icon name="arrow-right" size={14} className={styles.backIcon} />
        {t('project.back')}
      </button>

      {isError ? (
        <ErrorState
          message={t('project.error')}
          retryLabel={t('project.retry')}
          onRetry={onRetry}
        />
      ) : (
        <ProjectDetailWidget project={project} isLoading={isLoading} onRun={onRun} />
      )}
    </main>
  );
}

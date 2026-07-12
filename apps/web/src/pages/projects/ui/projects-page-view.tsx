import { useTranslation } from 'react-i18next';

import type { ProjectListItem } from '@/entities/project';
import { ProjectFilterBar, useProjectFilter } from '@/features/project-filter';
import { useReveal } from '@/shared/lib';
import { ErrorState, Heading, Icon, PageIntro } from '@sutuzhko/ui-kit';
import { ProjectList } from '@/widgets/project-list';

import styles from './projects-page.module.css';

const noop = () => undefined;

export interface ProjectsPageViewProps {
  readonly projects?: readonly ProjectListItem[];
  /** Интро-абзац экрана (серверное поле профиля). */
  readonly intro?: string | null;
  readonly isLoading?: boolean;
  readonly isError?: boolean;
  readonly onBack?: () => void;
  readonly onOpenProject?: (slug: string) => void;
  readonly onRetry?: () => void;
}

/**
 * Презентационный слой списка проектов: шапка-«крошка», панель фильтров и сетка
 * карточек. Список приходит пропсом (запросы и навигацию делает контейнер
 * `ProjectsPage`), фильтрация — клиентская. Управляемый `isLoading` наглядно
 * показывает состояние ожидания данных с сервера в Storybook.
 */
export function ProjectsPageView({
  projects,
  intro,
  isLoading,
  isError,
  onBack = noop,
  onOpenProject = noop,
  onRetry = noop,
}: ProjectsPageViewProps) {
  const { t } = useTranslation();
  const filter = useProjectFilter(projects ?? []);
  const revealRef = useReveal();

  if (isError) {
    return (
      <main id="main" className={styles.page}>
        <ErrorState
          message={t('projects.error')}
          retryLabel={t('projects.retry')}
          onRetry={onRetry}
        />
      </main>
    );
  }

  return (
    <main id="main" className={styles.page} ref={revealRef}>
      <button type="button" className={styles.back} onClick={onBack}>
        <Icon name="arrow-right" size={14} className={styles.backIcon} />
        {t('projects.back')}
      </button>

      <div className={styles.breadcrumb}>{t('projects.breadcrumb')}</div>
      <Heading level="h1" className={styles.title}>
        {t('projects.title')}
      </Heading>
      {/* Интро — серверное поле профиля. Скелетон — только когда данных нет
          (intro === undefined). Профиль обычно уже в кэше (его тянет футер),
          поэтому текст показываем сразу, не мигая скелетоном из-за загрузки списка. */}
      <PageIntro intro={intro} />

      <div className={styles.filter}>
        <ProjectFilterBar filter={filter} isLoading={isLoading} />
      </div>

      {!isLoading ? (
        <p className={styles.count}>
          {t('projects.results.found')}{' '}
          <span className={styles.countValue}>{filter.filtered.length}</span>
        </p>
      ) : null}

      <ProjectList
        projects={filter.filtered}
        isLoading={isLoading}
        onOpen={onOpenProject}
        onClearFilters={filter.clear}
      />
    </main>
  );
}

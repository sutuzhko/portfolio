import { useNavigate } from 'react-router-dom';

import { useProfile } from '@/entities/profile';
import { useProjects } from '@/entities/project';
import { projectPath, routePaths } from '@/shared/config';

import { ProjectsPageView } from './projects-page-view';

/**
 * Контейнер списка проектов: запрашивает проекты (`entities/project`,
 * локализованно) и навигацию, отдаёт данные презентационному `ProjectsPageView`.
 * Интро экрана берётся из профиля (`profile.projectsIntro`).
 */
export function ProjectsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useProjects();
  const { data: profile } = useProfile();

  return (
    <ProjectsPageView
      projects={data}
      intro={profile?.projectsIntro}
      isLoading={isLoading}
      isError={isError}
      onBack={() => void navigate(routePaths.home)}
      onOpenProject={(slug) => void navigate(projectPath(slug))}
      onRetry={() => void refetch()}
    />
  );
}

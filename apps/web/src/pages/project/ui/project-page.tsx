import { useNavigate, useParams } from 'react-router-dom';

import { useProject } from '@/entities/project';
import { routePaths } from '@/shared/config';
import { useRunner } from '@/widgets/runner';

import { ProjectPageView } from './project-page-view';

/**
 * Контейнер детали проекта: берёт slug из маршрута, запрашивает проект
 * (`entities/project`, локализованно), навигацию и запуск в раннере, отдаёт
 * `ProjectPageView`.
 */
export function ProjectPage() {
  const navigate = useNavigate();
  const { open: openRunner } = useRunner();
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError, refetch } = useProject(slug ?? '');

  // Запуск доступен только у запускаемого проекта с адресом для встраивания.
  const embedUrl = data?.embedUrl ?? null;
  const onRun =
    data !== undefined && data.runnable && embedUrl !== null
      ? () => openRunner({ title: data.title, embedUrl })
      : undefined;

  return (
    <ProjectPageView
      project={data}
      isLoading={isLoading}
      isError={isError}
      onBack={() => void navigate(routePaths.projects)}
      onRetry={() => void refetch()}
      onRun={onRun}
    />
  );
}

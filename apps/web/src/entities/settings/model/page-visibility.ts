import { routePaths } from '@/shared/config';

import { useGetSettingsQuery } from '../api/settings-api';

/** Видимость публичных страниц-роутов (из настроек сайта). */
export interface PageVisibility {
  readonly projects: boolean;
  readonly experience: boolean;
  readonly contact: boolean;
}

/**
 * Видимость страниц из настроек. Пока настройки не загрузились — считаем страницы
 * видимыми (не мигаем 404 и не прячем навигацию на время запроса).
 */
export function usePageVisibility(): PageVisibility {
  const { data } = useGetSettingsQuery();
  return {
    projects: data?.showProjects ?? true,
    experience: data?.showExperience ?? true,
    contact: data?.showContact ?? true,
  };
}

/**
 * Разрешён ли путь при данной видимости (для гейтинга роутов и консольного `cd`/`ls`).
 * Деталь проекта (`/projects/:slug`) следует за флагом страницы проектов.
 * Неизвестные/приватные пути (admin, database, login) — всегда разрешены.
 */
export function isPathEnabled(path: string, visibility: PageVisibility): boolean {
  if (path === routePaths.projects || path.startsWith(`${routePaths.projects}/`)) {
    return visibility.projects;
  }
  if (path === routePaths.experience) return visibility.experience;
  if (path === routePaths.contact) return visibility.contact;
  return true;
}

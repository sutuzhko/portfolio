/** Пути маршрутов приложения. Единый источник правды для роутера и ссылок. */
export const routePaths = {
  home: '/',
  projects: '/projects',
  /** Деталь проекта — паттерн с параметром `:slug` для роутера. */
  project: '/projects/:slug',
  experience: '/experience',
  contact: '/contact',
  login: '/login',
  /** Приватная база знаний (за гардом авторизации). */
  database: '/database',
  /** Личный кабинет / CMS (за гардом авторизации). */
  admin: '/admin',
  notFound: '*',
} as const;

/** Строит путь к странице конкретного проекта по его slug. */
export function projectPath(slug: string): string {
  return `/projects/${slug}`;
}

/**
 * Путь к вкладке кабинета в заданной локали редактирования. Локаль живёт в
 * маршруте: смена языка приложения меняет URL → компоненты пересобираются на
 * свежих данных нужной локали (нет риска показать данные другой локали).
 */
export function adminTabPath(tab: string, locale: string): string {
  return `/admin/${tab}/${locale}`;
}

/** Путь к детальному редактору элемента вкладки (`id` существующего или `new`). */
export function adminDetailPath(tab: string, locale: string, detail: string): string {
  return `/admin/${tab}/${locale}/${detail}`;
}

import { createBrowserRouter } from 'react-router-dom';

import { RootLayout } from '@/app/layout';
import { NotFoundPage } from '@/pages/not-found';
import { ServerErrorPage } from '@/pages/server-error';
import { routePaths } from '@/shared/config';

import { PageGate } from './page-gate';
import { RequireAuth } from './require-auth';

/**
 * Маршрутизатор приложения. Все маршруты обёрнуты в корневой лейаут (навбар +
 * подвал). Страницы подгружаются лениво (code splitting): каждый маршрут — в
 * отдельном чанке; сам лейаут в основном бандле, т.к. нужен всегда.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    // Ошибка рендера/загрузки любого маршрута показывает страницу 500.
    errorElement: <ServerErrorPage />,
    children: [
      {
        path: routePaths.home,
        lazy: async () => {
          const { HomePage } = await import('@/pages/home');
          return { Component: HomePage };
        },
      },
      {
        // Проекты (список + деталь) скрываются вместе флагом `showProjects`.
        element: <PageGate page="projects" />,
        children: [
          {
            path: routePaths.projects,
            lazy: async () => {
              const { ProjectsPage } = await import('@/pages/projects');
              return { Component: ProjectsPage };
            },
          },
          {
            path: routePaths.project,
            lazy: async () => {
              const { ProjectPage } = await import('@/pages/project');
              return { Component: ProjectPage };
            },
          },
        ],
      },
      {
        element: <PageGate page="experience" />,
        children: [
          {
            path: routePaths.experience,
            lazy: async () => {
              const { ExperiencePage } = await import('@/pages/experience');
              return { Component: ExperiencePage };
            },
          },
        ],
      },
      {
        element: <PageGate page="contact" />,
        children: [
          {
            path: routePaths.contact,
            lazy: async () => {
              const { ContactPage } = await import('@/pages/contact');
              return { Component: ContactPage };
            },
          },
        ],
      },
      {
        path: routePaths.login,
        lazy: async () => {
          const { LoginPage } = await import('@/pages/login');
          return { Component: LoginPage };
        },
      },
      {
        // Приватная зона — только для авторизованных (иначе редирект на /login).
        element: <RequireAuth />,
        children: [
          {
            path: routePaths.database,
            lazy: async () => {
              const { DatabasePage } = await import('@/pages/database');
              return { Component: DatabasePage };
            },
          },
          {
            // Голый `/admin` редиректит на вкладку профиля в текущей локали.
            path: routePaths.admin,
            lazy: async () => {
              const { AdminIndexRedirect } = await import('@/pages/admin');
              return { Component: AdminIndexRedirect };
            },
          },
          {
            // Вкладка кабинета: `/admin/:tab/:locale` (+ опц. `:detail` — id или `new`
            // для детальных редакторов). Локаль редактирования — в маршруте.
            path: `${routePaths.admin}/:tab/:locale/:detail?`,
            lazy: async () => {
              const { AdminPage } = await import('@/pages/admin');
              return { Component: AdminPage };
            },
          },
        ],
      },
      {
        // NotFoundPage не ленивая: она уже в основном графе (PageGate рендерит
        // её синхронно для выключенных страниц), поэтому отдельный lazy-чанк для
        // неё неэффективен (Rollup предупреждал INEFFECTIVE_DYNAMIC_IMPORT).
        path: routePaths.notFound,
        Component: NotFoundPage,
      },
    ],
  },
]);

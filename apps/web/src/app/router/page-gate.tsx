import { Outlet } from 'react-router-dom';

import { usePageVisibility, type PageVisibility } from '@/entities/settings';
import { NotFoundPage } from '@/pages/not-found';

interface PageGateProps {
  /** Какой флаг видимости страницы проверяем. */
  readonly page: keyof PageVisibility;
}

/**
 * Гейт публичной страницы по её видимости в настройках сайта. Если страница
 * выключена — отдаёт 404 (недоступна по прямому URL); иначе рендерит маршрут.
 * Пока настройки грузятся, `usePageVisibility` считает страницу видимой, поэтому
 * мигания 404 нет.
 */
export function PageGate({ page }: PageGateProps) {
  const visibility = usePageVisibility();
  return visibility[page] ? <Outlet /> : <NotFoundPage />;
}

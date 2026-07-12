import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/entities/session';
import { routePaths } from '@/shared/config';

/**
 * Гард приватных маршрутов: пропускает только авторизованных, иначе уводит на
 * `/login`, запоминая исходный путь (`state.from`) для возврата после входа.
 *
 * Пока идёт первичная проверка сессии (`isLoading`), ничего не рендерим — чтобы
 * не мигнуть редиректом до того, как статус авторизации станет известен.
 */
export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to={routePaths.login} state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

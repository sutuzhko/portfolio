import { Navigate } from 'react-router-dom';

import { adminTabPath, useAppLanguage } from '@/shared/config';

/**
 * Голый `/admin` перенаправляет на вкладку профиля в текущей локали приложения:
 * URL кабинета всегда несёт вкладку и локаль редактирования.
 */
export function AdminIndexRedirect() {
  const locale = useAppLanguage();
  return <Navigate to={adminTabPath('profile', locale)} replace />;
}

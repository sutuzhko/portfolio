import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useProfile } from '@/entities/profile';
import { useAuth, useLoginMutation, type LoginCredentials } from '@/entities/session';
import { useToaster } from '@/features/toaster';
import { routePaths } from '@/shared/config';

import { findTelegramContact } from '../model/telegram-contact';

import { LoginPageView } from './login-page-view';

/** Куда вернуть после входа: маршрут, с которого гард увёл на логин, иначе кабинет. */
function readRedirectTarget(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state) {
    const { from } = state;
    if (typeof from === 'string') return from;
  }
  return routePaths.admin;
}

/**
 * Контейнер входа: связывает форму с мутацией `login`, показывает тост об успехе
 * или ошибке и возвращает пользователя на исходный маршрут. Уже авторизованного
 * сразу перенаправляет — экран логина ему не нужен.
 */
export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useToaster();
  const { isAuthenticated, isLoading } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const [login, { isLoading: isSubmitting }] = useLoginMutation();
  const [invalid, setInvalid] = useState(false);

  const redirectTo = readRedirectTarget(location.state);
  const telegram = findTelegramContact(profile?.contacts);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const onSubmit = async (credentials: LoginCredentials): Promise<void> => {
    setInvalid(false);
    try {
      const user = await login(credentials).unwrap();
      notify({
        type: 'success',
        title: t('auth.toast.welcome.title'),
        description: t('auth.toast.welcome.desc', { username: user.username }),
      });
      void navigate(redirectTo, { replace: true });
    } catch {
      setInvalid(true);
      notify({
        type: 'error',
        title: t('auth.toast.error.title'),
        description: t('auth.toast.error.desc'),
      });
    }
  };

  return (
    <LoginPageView
      onSubmit={(credentials) => void onSubmit(credentials)}
      isSubmitting={isSubmitting}
      invalid={invalid}
      telegram={telegram}
      isProfileLoading={isProfileLoading}
    />
  );
}

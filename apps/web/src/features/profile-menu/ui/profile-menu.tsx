import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useProfile } from '@/entities/profile';
import { useAuth, useLogoutMutation } from '@/entities/session';
import { useToaster } from '@/features/toaster';
import { routePaths } from '@/shared/config';

import { ProfileMenuView } from './profile-menu-view';

/**
 * Контейнер меню профиля: берёт статус авторизации, ведёт выход (с тостом) и
 * навигацию на вход. Рендерится в слоте `profileMenu` навбара — поэтому виджеты
 * навбара не знают об авторизации, а связку сводит эта фича.
 */
export function ProfileMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notify } = useToaster();
  const { user } = useAuth();
  // Аватар берём из профиля (то же фото/инициалы, что видит посетитель сайта).
  const { data: profile } = useProfile();
  const [logout, { isLoading }] = useLogoutMutation();

  const onSignOut = async (): Promise<void> => {
    try {
      await logout().unwrap();
    } finally {
      // Даже если запрос упал, локально считаем сессию завершённой и уводим домой.
      notify({
        type: 'info',
        title: t('auth.toast.loggedOut.title'),
        description: t('auth.toast.loggedOut.desc'),
      });
      void navigate(routePaths.home);
    }
  };

  return (
    <ProfileMenuView
      user={user}
      avatarName={profile?.name}
      avatarPhotoUrl={profile?.avatarPhotoUrl}
      avatarColor={profile?.avatarColor}
      isSigningOut={isLoading}
      onSignIn={() => void navigate(routePaths.login)}
      onOpenSection={() => void navigate(routePaths.database)}
      onOpenAdmin={() => void navigate(routePaths.admin)}
      onSignOut={() => void onSignOut()}
    />
  );
}

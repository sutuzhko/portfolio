import { useTranslation } from 'react-i18next';

import type { AuthUser } from '@/entities/session';
import { Avatar, MenuItem } from '@sutuzhko/ui-kit';

import styles from './profile-menu.module.css';

export interface ProfileMenuViewProps {
  /** Текущий пользователь или `undefined` для гостя. */
  readonly user: AuthUser | undefined;
  /** Аватар из профиля (фото/цвет/имя для инициалов). До загрузки — undefined. */
  readonly avatarName?: string;
  readonly avatarPhotoUrl?: string | null;
  readonly avatarColor?: string | null;
  /** Идёт выход — блокируем повторное нажатие. */
  readonly isSigningOut?: boolean;
  readonly onSignIn: () => void;
  /** Открыть приватный раздел (база знаний) — основное действие. */
  readonly onOpenSection: () => void;
  readonly onOpenAdmin: () => void;
  readonly onSignOut: () => void;
}

/**
 * Презентационное содержимое меню профиля: гость видит «Войти», вошедший —
 * карточку пользователя и «Выйти». Рендерится внутри оверлея-меню навбара, поэтому
 * возвращает только пункты (без обёртки). Аватар декоративен — имя рядом текстом.
 */
export function ProfileMenuView({
  user,
  avatarName,
  avatarPhotoUrl,
  avatarColor,
  isSigningOut,
  onSignIn,
  onOpenSection,
  onOpenAdmin,
  onSignOut,
}: ProfileMenuViewProps) {
  const { t } = useTranslation();

  if (user === undefined) {
    return (
      <MenuItem icon="user" onClick={onSignIn}>
        {t('auth.signIn')}
      </MenuItem>
    );
  }

  return (
    <>
      <div className={styles.card}>
        <span aria-hidden="true">
          {/* Аватар из профиля: загруженное фото или инициалы имени на выбранном цвете.
              До загрузки профиля — инициалы логина как запасной вариант. */}
          <Avatar
            name={avatarName ?? user.username}
            src={avatarPhotoUrl ?? null}
            color={avatarColor ?? null}
            size={40}
          />
        </span>
        <div className={styles.cardText}>
          <span className={styles.label}>{t('auth.loggedInAs')}</span>
          <span className={styles.name}>{user.username}</span>
        </div>
      </div>
      <MenuItem icon="lock" primary onClick={onOpenSection}>
        {t('auth.openSection')}
      </MenuItem>
      <MenuItem icon="settings" bordered onClick={onOpenAdmin}>
        {t('auth.adminPanel')}
      </MenuItem>
      <MenuItem bordered disabled={isSigningOut} onClick={onSignOut}>
        {t('auth.signOut')}
      </MenuItem>
    </>
  );
}

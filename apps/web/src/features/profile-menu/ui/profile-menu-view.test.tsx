import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import type { AuthUser } from '@/entities/session';

import { ProfileMenuView, type ProfileMenuViewProps } from './profile-menu-view';

const admin: AuthUser = { id: 'u1', username: 'admin', role: 'ADMIN' };

// Пункты меню требуют родителя role="menu" (иначе нарушение aria-required-parent);
// провайдеры дают i18n, чтобы подписи были на русском.
function renderInMenu(props: Partial<ProfileMenuViewProps> = {}) {
  return renderWithProviders(
    <div role="menu" aria-label="Меню профиля">
      <ProfileMenuView
        user={undefined}
        onSignIn={vi.fn()}
        onOpenSection={vi.fn()}
        onOpenAdmin={vi.fn()}
        onSignOut={vi.fn()}
        {...props}
      />
    </div>,
  );
}

describe('ProfileMenuView', () => {
  it('гость видит «Войти» и вызывает onSignIn', async () => {
    const onSignIn = vi.fn();
    renderInMenu({ user: undefined, onSignIn });

    const item = screen.getByRole('menuitem', { name: 'Войти' });
    await userEvent.click(item);

    expect(onSignIn).toHaveBeenCalledOnce();
  });

  it('вошедший видит имя и выходит по «Выйти»', async () => {
    const onSignOut = vi.fn();
    renderInMenu({ user: admin, onSignOut });

    expect(screen.getByText('admin')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Выйти' }));

    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('вошедший открывает личный кабинет', async () => {
    const onOpenAdmin = vi.fn();
    renderInMenu({ user: admin, onOpenAdmin });

    await userEvent.click(screen.getByRole('menuitem', { name: 'Личный кабинет' }));

    expect(onOpenAdmin).toHaveBeenCalledOnce();
  });

  it('вошедший открывает приватный раздел', async () => {
    const onOpenSection = vi.fn();
    renderInMenu({ user: admin, onOpenSection });

    await userEvent.click(screen.getByRole('menuitem', { name: /Открыть раздел/ }));

    expect(onOpenSection).toHaveBeenCalledOnce();
  });

  it('блокирует «Выйти» во время выхода', () => {
    renderInMenu({ user: admin, isSigningOut: true });
    expect(screen.getByRole('menuitem', { name: 'Выйти' })).toBeDisabled();
  });

  it('карточка показывает аватар профиля (инициалы имени, не логина)', () => {
    renderInMenu({ user: admin, avatarName: 'Богдан Сутужко', avatarColor: '#238636' });
    // Инициалы берутся из имени профиля («БС»), а не из логина «admin» → «A».
    expect(screen.getByRole('img', { name: 'Богдан Сутужко', hidden: true })).toBeInTheDocument();
  });

  it('карточка показывает загруженное фото профиля', () => {
    renderInMenu({ user: admin, avatarName: 'Богдан Сутужко', avatarPhotoUrl: '/uploads/a.webp' });
    const photo = screen.getByRole('img', { name: 'Богдан Сутужко', hidden: true });
    expect(photo).toHaveAttribute('src', '/uploads/a.webp');
  });

  it('не нарушает доступность в обоих состояниях', async () => {
    const guest = renderInMenu({ user: undefined });
    expect(await axe(guest.container)).toHaveNoViolations();
    guest.unmount();

    const authed = renderInMenu({ user: admin });
    expect(await axe(authed.container)).toHaveNoViolations();
  });
});

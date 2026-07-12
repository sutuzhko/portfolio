import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import type { AuthUser } from '@/entities/session';

import { ProfileMenuView } from './ui/profile-menu-view';

const admin: AuthUser = { id: 'u1', username: 'admin', role: 'ADMIN' };

const meta = {
  title: 'Features/ProfileMenu',
  component: ProfileMenuView,
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
  args: {
    onSignIn: fn(),
    onOpenSection: fn(),
    onOpenAdmin: fn(),
    onSignOut: fn(),
    isSigningOut: false,
  },
  argTypes: {
    user: { control: false, table: { category: 'Данные' } },
    avatarName: { control: 'text', table: { category: 'Данные' } },
    avatarPhotoUrl: { control: 'text', table: { category: 'Данные' } },
    avatarColor: { control: 'color', table: { category: 'Данные' } },
    isSigningOut: { control: 'boolean', table: { category: 'Состояние' } },
    onSignIn: { control: false, table: { category: 'События' } },
    onOpenSection: { control: false, table: { category: 'События' } },
    onOpenAdmin: { control: false, table: { category: 'События' } },
    onSignOut: { control: false, table: { category: 'События' } },
  },
  // Пункты живут внутри оверлея-меню навбара — воспроизводим панель (role="menu").
  decorators: [
    (Story) => (
      <div
        role="menu"
        aria-label="Меню профиля"
        style={{
          width: 268,
          overflow: 'hidden',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border-strong)',
          borderRadius: 'var(--radius-card)',
        }}
      >
        {Story()}
      </div>
    ),
  ],
} satisfies Meta<typeof ProfileMenuView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Гость: единственный пункт — «Войти». */
export const LoggedOut: Story = {
  name: 'Гость',
  args: { user: undefined },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Войти' }));
    await expect(args.onSignIn).toHaveBeenCalled();
  },
};

/** Вошедший: карточка с аватаром профиля (инициалы имени) и «Выйти». */
export const LoggedIn: Story = {
  name: 'Вошедший',
  args: { user: admin, avatarName: 'Богдан Сутужко', avatarColor: '#238636' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('admin')).toBeInTheDocument();
    // Аватар — из профиля: инициалы имени «БС», а не логина.
    await expect(
      canvas.getByRole('img', { name: 'Богдан Сутужко', hidden: true }),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Выйти' }));
    await expect(args.onSignOut).toHaveBeenCalled();
  },
};

/** Аватар с загруженным фото (вместо инициалов). */
export const WithPhoto: Story = {
  name: 'С фото',
  args: {
    user: admin,
    avatarName: 'Богдан Сутужко',
    avatarPhotoUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#3c97e8"/></svg>',
      ),
  },
};

/** Идёт выход — «Выйти» заблокирована. */
export const SigningOut: Story = {
  name: 'Выход',
  args: { user: admin, isSigningOut: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('menuitem', { name: 'Выйти' })).toBeDisabled();
  },
};

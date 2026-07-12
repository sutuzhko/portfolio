import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { expect, fn, within } from 'storybook/test';

import { Avatar, MenuItem } from '@sutuzhko/ui-kit';

import { Navbar } from './ui/navbar';

// Демонстрационные пункты меню профиля. В приложении содержимое зависит от
// авторизации и приходит из приватной зоны (FE-3) — здесь только показываем оверлей.
const profileMenu = (
  <>
    <MenuItem icon="user">Профиль</MenuItem>
    <MenuItem icon="download">Скачать резюме</MenuItem>
    <MenuItem icon="lock" danger>
      Выйти
    </MenuItem>
  </>
);

const meta = {
  title: 'Widgets/Navbar',
  component: Navbar,

  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
  },

  // Бренд-ссылка использует React Router — оборачиваем истории в MemoryRouter.
  decorators: [(Story) => <MemoryRouter>{Story()}</MemoryRouter>],

  args: {
    onOpenConsole: fn(),
    profileMenu,
  },

  argTypes: {
    onOpenConsole: { control: false, table: { category: 'События' } },
    onProfileClick: { control: false, table: { category: 'События' } },
    profileMenu: { control: false, table: { category: 'Слоты' } },
    profileTrigger: { control: false, table: { category: 'Слоты' } },
  },
} satisfies Meta<typeof Navbar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Полная панель. play: `>_` открывает консоль, профиль раскрывает меню-оверлей. */
export const Playground: Story = {
  play: async ({ canvasElement, userEvent, args, step }) => {
    const canvas = within(canvasElement);
    await step('Клик по `>_` открывает консоль', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Открыть консоль' }));
      await expect(args.onOpenConsole).toHaveBeenCalledOnce();
    });
    await step('Клик по профилю раскрывает меню-оверлей', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Меню профиля' }));
      await expect(canvas.getByRole('menu')).toBeInTheDocument();
      await expect(canvas.getAllByRole('menuitem')).toHaveLength(3);
    });
  },
};

/**
 * Залогиненный пользователь: в триггере профиля — его аватар (фото/инициалы) вместо
 * обобщённой иконки. В приложении узел приходит из `ProfileMenuTrigger`.
 */
export const AuthenticatedTrigger: Story = {
  name: 'Аватар в триггере (вошедший)',
  args: {
    // Аватар заполняет кнопку (скруглённый квадрат); декоративен → aria-hidden.
    profileTrigger: (
      <span aria-hidden="true">
        <Avatar name="Богдан Сутужко" color="#238636" size={38} shape="square" />
      </span>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('img', { name: 'Богдан Сутужко', hidden: true }),
    ).toBeInTheDocument();
  },
};

/** Профиль без меню: клик просто вызывает `onProfileClick` (оверлей не открывается). */
export const WithoutMenu: Story = {
  name: 'Профиль без меню (коллбэк)',
  args: { profileMenu: undefined, onProfileClick: fn() },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Меню профиля' }));
    await expect(args.onProfileClick).toHaveBeenCalledOnce();
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
  },
};

/** Мобильная ширина (320px): управление доступно, бренд на ≤480 скрыт. */
export const Mobile: Story = {
  name: 'Мобильная ширина (320px)',
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Открыть консоль' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Меню профиля' })).toBeInTheDocument();
  },
};

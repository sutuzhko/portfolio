import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { mockDatabaseTree } from '@/entities/kb/mocks';

import { KbLibrary } from './ui/kb-library';

const meta = {
  title: 'Widgets/AdminKb',
  component: KbLibrary,
  parameters: { layout: 'padded' },
  args: {
    tree: mockDatabaseTree,
    selectedSlug: null,
    onSelectArticle: fn(),
    onNewArticle: fn(),
    onCreateFolder: fn(),
    onRenameFolder: fn(),
    onRenameArticle: fn(),
    onMoveFolder: fn(),
    onMoveArticle: fn(),
    onDeleteFolder: fn(),
    onDeleteArticle: fn(),
  },
  argTypes: {
    tree: { control: false, table: { category: 'Данные' } },
    selectedSlug: { control: 'text', table: { category: 'Состояние' } },
    onSelectArticle: { control: false, table: { category: 'События' } },
    onNewArticle: { control: false, table: { category: 'События' } },
    onCreateFolder: { control: false, table: { category: 'События' } },
    onRenameFolder: { control: false, table: { category: 'События' } },
    onRenameArticle: { control: false, table: { category: 'События' } },
    onMoveFolder: { control: false, table: { category: 'События' } },
    onMoveArticle: { control: false, table: { category: 'События' } },
    onDeleteFolder: { control: false, table: { category: 'События' } },
    onDeleteArticle: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof KbLibrary>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Дерево со счётчиками; клик по статье выбирает её. */
export const Default: Story = {
  name: 'Библиотека',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('2 папок · 4 статей')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /Хуки React/ }));
    await expect(args.onSelectArticle).toHaveBeenCalledWith('react-hooks');
  },
};

/** Выбранная статья подсвечена в дереве. */
export const Selected: Story = {
  name: 'С выбранной статьёй',
  args: { selectedSlug: 'react-fiber' },
};

/** Контекст-меню узла: переименовать / добавить / переместить / удалить. */
export const ContextMenu: Story = {
  name: 'Контекст-меню',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [menu] = canvas.getAllByRole('button', { name: 'Действия' });
    if (!menu) throw new Error('нет кнопки меню узла');
    await userEvent.click(menu);
    await expect(canvas.getByRole('menuitem', { name: 'Переименовать' })).toBeVisible();
    await expect(canvas.getByRole('menuitem', { name: 'Удалить' })).toBeVisible();
  },
};

/** Инлайн-форма создания папки. */
export const NewFolder: Story = {
  name: 'Новая папка',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Новая папка' }));
    await expect(canvas.getByPlaceholderText('Название папки')).toBeVisible();
  },
};

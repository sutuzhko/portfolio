import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { mockArticle } from '@/entities/kb/mocks';

import { KbArticleViewer } from './ui/kb-article-viewer';

const meta = {
  title: 'Widgets/AdminKb/ArticleViewer',
  component: KbArticleViewer,
  parameters: { layout: 'padded' },
  args: {
    article: mockArticle,
    hasSelection: true,
    isLoading: false,
    onEdit: fn(),
    onNavigate: fn(),
  },
  argTypes: {
    article: { control: false, table: { category: 'Данные' } },
    hasSelection: { control: 'boolean', table: { category: 'Состояние' } },
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    onEdit: { control: false, table: { category: 'События' } },
    onNavigate: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof KbArticleViewer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Статья: теги, дата, тело в Markdown и бэклинки. */
export const Content: Story = {
  name: 'Статья',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('#react')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /Редактировать/ })).toBeVisible();
  },
};

/** Ничего не выбрано — приглашающее пустое состояние. */
export const Empty: Story = {
  name: 'Пусто',
  args: { hasSelection: false, article: undefined },
};

/** Загрузка выбранной статьи — скелетон. */
export const Loading: Story = {
  name: 'Загрузка',
  args: { isLoading: true, article: undefined },
};

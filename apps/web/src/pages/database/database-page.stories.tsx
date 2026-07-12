import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { mockArticle, mockDatabaseTree } from '@/entities/kb/mocks';

import { DatabasePageView } from './ui/database-page-view';

const meta = {
  title: 'Pages/Database',
  component: DatabasePageView,
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
  args: {
    tree: mockDatabaseTree,
    article: mockArticle,
    selectedSlug: 'react-hooks',
    isTreeLoading: false,
    isTreeError: false,
    isArticleLoading: false,
    isArticleError: false,
    onSelectArticle: fn(),
    onBack: fn(),
    onRetryTree: fn(),
    onRetryArticle: fn(),
  },
  argTypes: {
    tree: { control: false, table: { category: 'Данные' } },
    article: { control: false, table: { category: 'Данные' } },
    isTreeLoading: { control: 'boolean', table: { category: 'Состояние' } },
    isArticleLoading: { control: 'boolean', table: { category: 'Состояние' } },
    isTreeError: { control: 'boolean', table: { category: 'Состояние' } },
    onSelectArticle: { control: false, table: { category: 'События' } },
    onBack: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof DatabasePageView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  name: 'База знаний',
};

/** Дерево и статья грузятся — оба под скелетонами. */
export const Loading: Story = {
  name: 'Загрузка',
  args: {
    tree: undefined,
    article: undefined,
    isTreeLoading: true,
    isArticleLoading: true,
  },
};

/** Ошибка дерева — на уровне страницы (без него читать нечего). */
export const TreeError: Story = {
  name: 'Ошибка дерева',
  args: { tree: undefined, isTreeError: true },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

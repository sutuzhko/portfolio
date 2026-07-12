import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import type { ArticleDetail } from '@/entities/kb';
import { mockArticle } from '@/entities/kb/mocks';

import { KbArticle } from './ui/kb-article';

const withWikilink: ArticleDetail = {
  slug: 'ts-generics',
  title: 'Дженерики на практике',
  tags: ['typescript'],
  status: 'PUBLISHED',
  updatedAt: '2026-07-01T16:45:00.000Z',
  breadcrumb: ['TypeScript', 'Дженерики на практике'],
  backlinks: [],
  bodyMarkdown:
    'Дженерики сохраняют связь типов. Хороший пример пользы — типобезопасные хуки, см. [[react-hooks]].',
};

const meta = {
  title: 'Widgets/KbArticle',
  component: KbArticle,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: {
    article: mockArticle,
    hasSelection: true,
    isLoading: false,
    isError: false,
    onNavigate: fn(),
    onRetry: fn(),
  },
  argTypes: {
    article: { control: false, table: { category: 'Данные' } },
    hasSelection: { control: 'boolean', table: { category: 'Состояние' } },
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    isError: { control: 'boolean', table: { category: 'Состояние' } },
    onNavigate: { control: false, table: { category: 'События' } },
    onRetry: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof KbArticle>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Статья с крошками, тегами, телом и бэклинками. */
export const Loaded: Story = {
  name: 'Статья',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'О базе знаний' }));
    await expect(args.onNavigate).toHaveBeenCalledWith('welcome');
  },
};

/** Вики-ссылка `[[slug]]` в тексте — кликабельна. */
export const WithWikilink: Story = {
  name: 'С вики-ссылкой',
  args: { article: withWikilink },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'react-hooks' }));
    await expect(args.onNavigate).toHaveBeenCalledWith('react-hooks');
  },
};

/** Ничего не выбрано — приглашение выбрать статью. */
export const Empty: Story = {
  name: 'Без выбора',
  args: { hasSelection: false, article: undefined },
};

export const Loading: Story = {
  name: 'Загрузка',
  args: { isLoading: true, article: undefined },
};

export const ErrorState: Story = {
  name: 'Ошибка',
  args: { isError: true, article: undefined },
};

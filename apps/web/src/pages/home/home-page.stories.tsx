import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { mockProfile } from '@/entities/profile/mocks';
import { mockProjects } from '@/entities/project/mocks';
import { mockCodewarsStats, mockGithubStats } from '@/entities/stats/mocks';

import { HomePageView } from './ui/home-page-view';

const featured = mockProjects.filter((project) => project.pinned);

const meta = {
  title: 'Pages/Home',
  component: HomePageView,
  parameters: { layout: 'fullscreen' },
  args: {
    profile: mockProfile,
    githubStats: mockGithubStats,
    githubError: false,
    codewarsStats: mockCodewarsStats,
    codewarsError: false,
    featured,
    isLoading: false,
    isError: false,
    onRetry: () => undefined,
    onOpenProjects: () => undefined,
    onOpenProject: fn(),
  },
  argTypes: {
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    isError: { control: 'boolean', table: { category: 'Состояние' } },
    githubError: { control: 'boolean', table: { category: 'Состояние' } },
    codewarsError: { control: 'boolean', table: { category: 'Состояние' } },
    profile: { control: 'object', table: { category: 'Данные' } },
    githubStats: { control: 'object', table: { category: 'Данные' } },
    codewarsStats: { control: 'object', table: { category: 'Данные' } },
    featured: { control: 'object', table: { category: 'Данные' } },
    sections: { control: 'object', table: { category: 'Данные' } },
    onRetry: { control: false, table: { disable: true } },
    onOpenProjects: { control: false, table: { disable: true } },
    onOpenProject: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof HomePageView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  name: 'С данными',
  play: async ({ canvas, args, userEvent }) => {
    await expect(canvas.getByRole('heading', { name: 'Богдан Сутужко' })).toBeInTheDocument();
    // Клик по избранной плитке ведёт на страницу детали проекта.
    await userEvent.click(canvas.getByRole('button', { name: new RegExp(featured[0].title) }));
    await expect(args.onOpenProject).toHaveBeenCalledWith(featured[0].slug);
  },
};

export const Loading: Story = {
  name: 'Ожидание данных (isLoading)',
  args: { isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Пока грузится — контент профиля скрыт (везде скелетоны).
    await expect(canvas.queryByRole('heading', { name: 'Богдан Сутужко' })).not.toBeInTheDocument();
  },
};

export const Failed: Story = {
  name: 'Ошибка загрузки',
  args: { isError: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toBeInTheDocument();
  },
};

/** Часть секций выключена в настройках сайта — блоки не рендерятся. */
export const HiddenSections: Story = {
  name: 'Секции выключены',
  args: { sections: { featured: false, activity: false } },
  play: async ({ canvas }) => {
    // Hero остаётся, а выключенная плитка избранного отсутствует.
    await expect(canvas.getByRole('heading', { name: 'Богдан Сутужко' })).toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: new RegExp(featured[0].title) }),
    ).not.toBeInTheDocument();
  },
};

export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

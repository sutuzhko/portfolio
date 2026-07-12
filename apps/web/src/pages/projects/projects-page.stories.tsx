import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { mockProjects } from '@/entities/project/mocks';

import { ProjectsPageView } from './ui/projects-page-view';

const meta = {
  title: 'Pages/Projects',
  component: ProjectsPageView,
  parameters: { layout: 'fullscreen' },
  args: {
    projects: mockProjects,
    intro:
      'Коммерческие продукты и pet-проекты, над которыми я работал. Фильтруйте по стеку и участникам, чтобы найти нужное.',
    isLoading: false,
    isError: false,
    onBack: () => undefined,
    onOpenProject: () => undefined,
    onRetry: () => undefined,
  },
  argTypes: {
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    isError: { control: 'boolean', table: { category: 'Состояние' } },
    projects: { control: 'object', table: { category: 'Данные' } },
    intro: { control: 'text', table: { category: 'Данные' } },
    onBack: { control: false, table: { disable: true } },
    onOpenProject: { control: false, table: { disable: true } },
    onRetry: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof ProjectsPageView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  name: 'С данными',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /Procharity/ })).toBeInTheDocument();
  },
};

export const Loading: Story = {
  name: 'Ожидание данных',
  // Данных ещё нет (список + intro профиля undefined) → скелетоны. Скелетон завязан
  // на отсутствие данных: если бы intro пришёл (из кэша), он бы показался текстом.
  args: { isLoading: true, intro: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /Procharity/ })).not.toBeInTheDocument();
    // Интро без данных (undefined) — под скелетоном, не текстом.
    await expect(canvas.queryByText(/Коммерческие продукты и pet-проекты/)).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  name: 'Нет проектов',
  args: { projects: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Ничего не найдено')).toBeInTheDocument();
  },
};

export const Failed: Story = {
  name: 'Ошибка загрузки',
  args: { isError: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

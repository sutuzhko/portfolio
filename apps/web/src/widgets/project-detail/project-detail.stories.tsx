import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { mockProjectDetail } from '@/entities/project/mocks';

import { ProjectDetail } from './ui/project-detail';

// Запускаемый проект: с embedUrl и подсказкой — показывает кнопку «▶ Запустить».
const runnableProject = {
  ...mockProjectDetail,
  slug: '2048',
  title: 'Игра: 2048',
  runnable: true,
  embedUrl: 'https://sutuzhko.github.io/2048/',
  runHint: 'Используйте стрелки, чтобы двигать тайлы.',
};

const meta = {
  title: 'Widgets/ProjectDetail',
  component: ProjectDetail,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: { project: mockProjectDetail, isLoading: false },
  argTypes: {
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    project: { control: 'object', table: { category: 'Данные' } },
    onRun: { control: false, table: { disable: true } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-page)' }}>{Story()}</div>],
} satisfies Meta<typeof ProjectDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Полная деталь: баннер, тело (Markdown + «что внутри» + галерея), сайдбар. */
export const Loaded: Story = {
  name: 'С данными',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Procharity' })).toBeInTheDocument();
  },
};

/** Запускаемый проект: primary-кнопка «▶ Запустить» открывает раннер. */
export const Runnable: Story = {
  name: 'Запускаемый (▶ Запустить)',
  args: { project: runnableProject, onRun: fn() },
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Запустить/ }));
    await expect(args.onRun).toHaveBeenCalled();
  },
};

/** Данные грузятся — скелетон той же раскладки. */
export const Loading: Story = {
  name: 'Ожидание данных (isLoading)',
  args: { isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('heading', { name: 'Procharity' })).not.toBeInTheDocument();
  },
};

/** Мобильная раскладка: сайдбар складывается под основную колонку. */
export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

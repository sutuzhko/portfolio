import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { mockProjectDetail } from '@/entities/project/mocks';

import { ProjectPageView } from './ui/project-page-view';

const meta = {
  title: 'Pages/Project',
  component: ProjectPageView,
  parameters: { layout: 'fullscreen' },
  args: {
    project: mockProjectDetail,
    isLoading: false,
    isError: false,
    onBack: () => undefined,
    onRetry: () => undefined,
  },
  argTypes: {
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    isError: { control: 'boolean', table: { category: 'Состояние' } },
    project: { control: 'object', table: { category: 'Данные' } },
    onBack: { control: false, table: { disable: true } },
    onRetry: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof ProjectPageView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  name: 'С данными',
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Procharity' })).toBeInTheDocument();
  },
};

export const Loading: Story = {
  name: 'Ожидание данных (isLoading)',
  args: { isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('heading', { name: 'Procharity' })).not.toBeInTheDocument();
  },
};

export const Failed: Story = {
  name: 'Ошибка загрузки',
  args: { isError: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

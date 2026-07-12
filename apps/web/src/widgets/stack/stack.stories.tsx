import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { mockTechnologies } from '@/entities/technology/mocks';

import { Stack } from './ui/stack';

const meta = {
  title: 'Widgets/Stack',
  component: Stack,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: { technologies: mockTechnologies, isLoading: false },
  argTypes: {
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    technologies: { control: 'object', table: { category: 'Данные' } },
    id: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-page)' }}>{Story()}</div>],
} satisfies Meta<typeof Stack>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Заголовок `// стек` + карточки-слои с метками технологий. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: '// стек' })).toBeInTheDocument();
    await expect(canvas.getByText('Frontend')).toBeInTheDocument();
    await expect(canvas.getByText('NestJS')).toBeInTheDocument();
  },
};

/** Технологии грузятся — скелетон карточек-слоёв. */
export const Loading: Story = {
  name: 'Ожидание данных (isLoading)',
  args: { isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Frontend')).not.toBeInTheDocument();
  },
};

/** Край: пустой стек — заголовок есть, карточек нет. */
export const Empty: Story = {
  name: 'Край: пустой стек',
  args: { technologies: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: '// стек' })).toBeInTheDocument();
  },
};

/** Мобильная раскладка: грид слоёв 3 → 2 → 1. */
export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

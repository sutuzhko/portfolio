import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { mockExperience } from '@/entities/experience/mocks';

import { ExperienceTimeline } from './ui/experience-timeline';

const meta = {
  title: 'Widgets/ExperienceTimeline',
  component: ExperienceTimeline,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: { jobs: mockExperience, isLoading: false },
  argTypes: {
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    jobs: { control: 'object', table: { category: 'Данные' } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 720 }}>{Story()}</div>],
} satisfies Meta<typeof ExperienceTimeline>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Таймлайн мест работы. play: роль текущего места отображается. */
export const Loaded: Story = {
  name: 'С данными',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Frontend-разработчик' })).toBeInTheDocument();
  },
};

/** Опыт грузится — скелетон-карточки с той же точкой-линией. */
export const Loading: Story = {
  name: 'Ожидание данных (isLoading)',
  args: { isLoading: true },
};

/** Край: единственная запись — линия под точкой скрыта (последний элемент). */
export const SingleJob: Story = {
  name: 'Край: одна запись',
  args: { jobs: mockExperience.slice(0, 1) },
};

/** Мобильная раскладка. */
export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

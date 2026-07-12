import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { mockEducation } from '@/entities/education/mocks';
import { mockExperience } from '@/entities/experience/mocks';
import { mockLanguages } from '@/entities/language/mocks';
import { mockSkills } from '@/entities/skill/mocks';

import { ExperiencePageView } from './ui/experience-page-view';

const meta = {
  title: 'Pages/Experience',
  component: ExperiencePageView,
  parameters: { layout: 'fullscreen' },
  args: {
    experience: mockExperience,
    education: mockEducation,
    languages: mockLanguages,
    skills: mockSkills,
    intro:
      'Уверенно работаю и с Vue, и с React-экосистемами. Системно подхожу к переиспользованию — на нескольких проектах строил UI-kit с нуля.',
    isLoading: false,
    isError: false,
    onBack: () => undefined,
    onRetry: () => undefined,
  },
  argTypes: {
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    isError: { control: 'boolean', table: { category: 'Состояние' } },
    experience: { control: 'object', table: { category: 'Данные' } },
    education: { control: 'object', table: { category: 'Данные' } },
    languages: { control: 'object', table: { category: 'Данные' } },
    skills: { control: 'object', table: { category: 'Данные' } },
    intro: { control: 'text', table: { category: 'Данные' } },
    onBack: { control: false, table: { disable: true } },
    onRetry: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof ExperiencePageView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  name: 'С данными',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Опыт работы' })).toBeInTheDocument();
  },
};

export const Loading: Story = {
  name: 'Ожидание данных',
  // Данных ещё нет (опыт + intro профиля undefined) → скелетоны. Скелетон завязан
  // на отсутствие данных: если бы intro пришёл (из кэша), он бы показался текстом.
  args: { isLoading: true, intro: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Интро без данных (undefined) — под скелетоном, не текстом.
    await expect(canvas.queryByText(/Уверенно работаю и с Vue/)).not.toBeInTheDocument();
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

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { mockEducation } from '@/entities/education/mocks';
import { mockLanguages } from '@/entities/language/mocks';
import { mockSkills } from '@/entities/skill/mocks';

import { ResumeDetails } from './ui/resume-details';

const meta = {
  title: 'Widgets/ResumeDetails',
  component: ResumeDetails,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: {
    education: mockEducation,
    languages: mockLanguages,
    skills: mockSkills,
    isLoading: false,
  },
  argTypes: {
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    education: { control: 'object', table: { category: 'Данные' } },
    languages: { control: 'object', table: { category: 'Данные' } },
    skills: { control: 'object', table: { category: 'Данные' } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-page)' }}>{Story()}</div>],
} satisfies Meta<typeof ResumeDetails>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Две колонки: образование слева, языки + навыки справа. */
export const Loaded: Story = {
  name: 'С данными',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Образование')).toBeInTheDocument();
    await expect(canvas.getByText('Языки')).toBeInTheDocument();
  },
};

/** Все разделы грузятся — каждая карточка показывает свой скелетон. */
export const Loading: Story = {
  name: 'Ожидание данных (isLoading)',
  args: { isLoading: true },
};

/**
 * Частичная загрузка: образование пришло, языки и навыки — ещё нет. Карточки
 * независимы, поэтому каждая скелетонит свой раздел, не дожидаясь соседей.
 */
export const PartialLoading: Story = {
  name: 'Частичная загрузка',
  args: { languages: undefined, skills: undefined },
};

/** Мобильная раскладка: колонки складываются в одну. */
export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

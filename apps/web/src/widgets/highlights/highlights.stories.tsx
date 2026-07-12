import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Highlights } from './ui/highlights';

// Показатели для историй — форма `profile.highlights` с бэкенда; их можно
// редактировать прямо в контролах Storybook.
const defaultItems = [
  { value: '3+', label: 'года в коммерческой разработке' },
  { value: '3', label: 'UI-kit построил с нуля' },
  { value: 'C1', label: 'English — доки и issues без перевода' },
  { value: '3 kyu', label: 'Codewars · 62 ката решено' },
];

const meta = {
  title: 'Widgets/Highlights',
  component: Highlights,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: { items: defaultItems, isLoading: false },
  argTypes: {
    items: {
      control: 'object',
      description: 'Показатели: { value, label }. Редактируйте значения и подписи.',
      table: { category: 'Контент' },
    },
    isLoading: {
      control: 'boolean',
      description: 'Профиль ещё грузится — вместо показателей рендерится скелетон.',
      table: { category: 'Состояние' },
    },
    className: { control: false, table: { disable: true } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-page)' }}>{Story()}</div>],
} satisfies Meta<typeof Highlights>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Четыре показателя в ряд. play: список из 4 элементов с крупными значениями. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('3+')).toBeInTheDocument();
    await expect(canvas.getByText('3 kyu')).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
  },
};

/** Профиль грузится — скелетон повторяет раскладку карточек (`aria-busy`). */
export const Loading: Story = {
  name: 'Загрузка (скелетон)',
  args: { isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('list')).toHaveAttribute('aria-busy', 'true');
  },
};

/** Край: длинные подписи переносятся, высота карточек выравнивается. */
export const LongLabels: Story = {
  name: 'Край: длинные подписи',
  args: {
    items: [
      {
        value: '5+',
        label: 'лет коммерческой разработки на React, Vue и Node в продуктовых командах',
      },
      { value: '12', label: 'проектов в портфолио, включая коммерческие продукты и pet-проекты' },
      { value: 'C1', label: 'английский — читаю документацию и веду issues без перевода' },
    ],
  },
};

/** Мобильная раскладка: грид 4 → 2 → 1. */
export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

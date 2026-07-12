import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { mockExperienceAdmin } from '@/entities/experience/mocks';

import { AdminExperienceView } from './ui/admin-experience-view';

const meta = {
  title: 'Widgets/AdminExperience',
  component: AdminExperienceView,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: {
    items: mockExperienceAdmin,
    locale: 'ru',
    isBusy: false,
    onAdd: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
  argTypes: {
    items: { control: false, table: { category: 'Данные' } },
    locale: { control: 'inline-radio', options: ['ru', 'en'], table: { category: 'Данные' } },
    isBusy: { control: 'boolean', table: { category: 'Состояние' } },
    onAdd: { control: false, table: { category: 'События' } },
    onEdit: { control: false, table: { category: 'События' } },
    onDelete: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof AdminExperienceView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Список мест работы; добавление и правка ведут на отдельные маршруты. */
export const Default: Story = {
  name: 'Список',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Добавить' }));
    await expect(args.onAdd).toHaveBeenCalled();
  },
};

/** Английская локаль — роли в переводе. */
export const English: Story = {
  name: 'Локаль EN',
  args: { locale: 'en' },
};

/** Пустой список — только кнопка добавления. */
export const Empty: Story = {
  name: 'Пусто',
  args: { items: [] },
};

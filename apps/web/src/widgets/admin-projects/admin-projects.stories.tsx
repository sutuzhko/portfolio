import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { mockContributorsAdmin } from '@/entities/contributor/mocks';
import { mockProjectsAdmin } from '@/entities/project/mocks';
import { mockTechnologiesAdmin } from '@/entities/technology/mocks';

import { AdminProjectsView } from './ui/admin-projects-view';

const meta = {
  title: 'Widgets/AdminProjects',
  component: AdminProjectsView,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: {
    items: mockProjectsAdmin,
    technologies: mockTechnologiesAdmin,
    contributors: mockContributorsAdmin,
    locale: 'ru',
    isBusy: false,
    onAdd: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
  argTypes: {
    items: { control: false, table: { category: 'Данные' } },
    technologies: { control: false, table: { category: 'Данные' } },
    contributors: { control: false, table: { category: 'Данные' } },
    locale: { control: 'inline-radio', options: ['ru', 'en'], table: { category: 'Данные' } },
    isBusy: { control: 'boolean', table: { category: 'Состояние' } },
    onAdd: { control: false, table: { category: 'События' } },
    onEdit: { control: false, table: { category: 'События' } },
    onDelete: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof AdminProjectsView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Список проектов: плитка, избранное, теги, статус. Форма — на своём маршруте. */
export const Default: Story = {
  name: 'Список',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Новый проект' }));
    await expect(args.onAdd).toHaveBeenCalled();
  },
};

/** Английская локаль — названия/статусы в переводе. */
export const English: Story = {
  name: 'Локаль EN',
  args: { locale: 'en' },
};

/** Пустой список — только кнопка добавления. */
export const Empty: Story = {
  name: 'Пусто',
  args: { items: [] },
};

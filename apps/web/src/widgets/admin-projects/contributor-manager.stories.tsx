import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { mockContributorsAdmin } from '@/entities/contributor/mocks';

import { initStaged, visibleStaged } from './model/contributor-staging';
import { ContributorManager } from './ui/contributor-manager';

const meta = {
  title: 'Widgets/AdminProjects/ContributorManager',
  component: ContributorManager,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: {
    locale: 'ru',
    disabled: false,
    staged: visibleStaged(initStaged(mockContributorsAdmin)),
    selectedIds: ['bogdan', 'alex'],
    onToggle: fn(),
    onStageCreate: fn(),
    onStageUpdate: fn(),
    onStageDelete: fn(),
  },
  argTypes: {
    staged: { control: false, table: { category: 'Данные' } },
    selectedIds: { control: false, table: { category: 'Данные' } },
    locale: { control: 'inline-radio', options: ['ru', 'en'], table: { category: 'Данные' } },
    disabled: { control: 'boolean', table: { category: 'Состояние' } },
    onToggle: { control: false, table: { category: 'События' } },
    onStageCreate: { control: false, table: { category: 'События' } },
    onStageUpdate: { control: false, table: { category: 'События' } },
    onStageDelete: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof ContributorManager>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Чипы-выбор участников; у каждого — карандаш правки, ниже — «+ создать участника». */
export const Default: Story = {
  name: 'Выбор участников',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: '+ создать участника' })).toBeInTheDocument();
  },
};

/** Создание: инлайн-форма с именем, палитрой цвета и ссылкой. */
export const Creating: Story = {
  name: 'Создание',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '+ создать участника' }));
    await expect(canvas.getByRole('textbox', { name: 'Имя' })).toBeInTheDocument();
  },
};

/** Правка существующего участника (по карандашу): поля предзаполнены + «Удалить». */
export const Editing: Story = {
  name: 'Правка',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Редактировать «Богдан Сутужко»' }));
    await expect(canvas.getByRole('textbox', { name: 'Имя' })).toHaveValue('Богдан Сутужко');
    await expect(canvas.getByRole('button', { name: 'Удалить' })).toBeInTheDocument();
  },
};

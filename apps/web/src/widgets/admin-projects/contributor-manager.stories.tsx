import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

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
    onReorder: fn(),
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
    onReorder: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof ContributorManager>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Чипы-выбор участников в порядке каталога; у каждого — ручка перетаскивания и карандаш
 * правки, ниже — «+ создать участника».
 */
export const Default: Story = {
  name: 'Выбор участников',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: '+ создать участника' })).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Переместить «Богдан Сутужко»' }),
    ).toBeInTheDocument();
  },
};

/** Перестановка с клавиатуры: пробел на ручке — взять, стрелка — сдвинуть, пробел — положить. */
export const Reordering: Story = {
  name: 'Перестановка',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('button', { name: 'Переместить «Иван Петров»' }).focus();
    await userEvent.keyboard('[Space]');
    await userEvent.keyboard('[ArrowLeft]');
    await userEvent.keyboard('[Space]');
    await waitFor(() => expect(args.onReorder).toHaveBeenCalledWith('ivan', 'maria'));
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

/** Идёт сохранение проекта — ручки, карандаши и «+ создать» заблокированы. */
export const Disabled: Story = {
  name: 'Заблокировано',
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Переместить «Богдан Сутужко»' }),
    ).toBeDisabled();
    await expect(canvas.getByRole('button', { name: '+ создать участника' })).toBeDisabled();
  },
};

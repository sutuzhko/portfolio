import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { mockLanguagesAdmin } from '@/entities/language/mocks';
import { mockSkillsAdmin } from '@/entities/skill/mocks';
import { mockTechnologiesAdmin } from '@/entities/technology/mocks';

import {
  buildLangRows,
  buildSkillChips,
  buildTechCategories,
  buildTechChips,
} from './model/stack-form';
import { AdminStackView } from './ui/admin-stack-view';

const categories = buildTechCategories(mockTechnologiesAdmin);

const meta = {
  title: 'Widgets/AdminStack',
  component: AdminStackView,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: {
    techCategories: categories,
    chips: buildTechChips(mockTechnologiesAdmin, categories),
    langRows: buildLangRows(mockLanguagesAdmin, 'ru'),
    skillChips: buildSkillChips(mockSkillsAdmin, 'ru'),
    isBusy: false,
    onSave: fn(),
  },
  argTypes: {
    techCategories: { control: false, table: { category: 'Данные' } },
    chips: { control: false, table: { category: 'Данные' } },
    langRows: { control: false, table: { category: 'Данные' } },
    skillChips: { control: false, table: { category: 'Данные' } },
    isBusy: { control: 'boolean', table: { category: 'Состояние' } },
    onSave: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof AdminStackView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Категории-блоки технологий + строки языков + навыки, одно «Сохранить». */
export const Default: Story = {
  name: 'Стек и языки',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('React')).toBeInTheDocument();
    await expect(canvas.getByText('NestJS')).toBeInTheDocument();
    // Карандаш переименования категории «Frontend» доступен.
    await expect(
      canvas.getByRole('button', { name: 'Переименовать «Frontend»' }),
    ).toBeInTheDocument();
  },
};

/** Добавление технологии: «+» в блоке раскрывает пустой инлайн-чип. */
export const AddTechnology: Story = {
  name: 'Добавить технологию',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Добавить в «Backend»' }));
    const input = canvas.getByRole('textbox', { name: 'Технология' });
    await userEvent.type(input, 'GraphQL');
    await expect(input).toHaveValue('GraphQL');
  },
};

/** Переименование категории: карандаш открывает инлайн-поле заголовка. */
export const RenameCategory: Story = {
  name: 'Переименовать блок',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Переименовать «Tooling»' }));
    await expect(canvas.getByRole('textbox', { name: 'Название блока' })).toHaveValue('Tooling');
  },
};

/** Добавление блока-категории: «+ блок» у заголовка «Технологии». */
export const AddCategory: Story = {
  name: 'Добавить блок',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '+ блок' }));
    await expect(canvas.getByRole('textbox', { name: 'Название блока' })).toBeInTheDocument();
  },
};

/** Удаление блока целиком: корзина у заголовка убирает категорию с её чипами. */
export const DeleteBlock: Story = {
  name: 'Удалить блок',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Удалить блок «Tooling»' }));
    await expect(canvas.queryByText('Tooling')).not.toBeInTheDocument();
    // Правка включает «Сохранить» (по умолчанию заблокирована — гейт «isDirty»).
    await expect(canvas.getByRole('button', { name: /Сохранить/ })).toBeEnabled();
  },
};

/** Пустой стек — только «+ блок», пустые языки и навыки. Бар сохранения скрыт. */
export const Empty: Story = {
  name: 'Пусто',
  args: { techCategories: [], chips: [], langRows: [], skillChips: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /Сохранить/ })).not.toBeInTheDocument();
  },
};

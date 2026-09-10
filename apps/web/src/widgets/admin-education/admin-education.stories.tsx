import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { mockEducationAdmin } from '@/entities/education/mocks';

import { buildRows } from './model/education-form';
import { AdminEducationView } from './ui/admin-education-view';

const meta = {
  title: 'Widgets/AdminEducation',
  component: AdminEducationView,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: {
    rows: buildRows(mockEducationAdmin, 'ru'),
    isBusy: false,
    onSave: fn(),
  },
  argTypes: {
    rows: { control: false, table: { category: 'Данные' } },
    isBusy: { control: 'boolean', table: { category: 'Состояние' } },
    onSave: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof AdminEducationView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Всегда редактируемые карточки по двум секциям; «Сохранить» пакетом. */
export const Default: Story = {
  name: 'Образование',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Бар «Сохранить/Отменить» появляется только при заполненных правках — без них его нет.
    await expect(canvas.queryByRole('button', { name: /Сохранить/ })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '+ запись' }));
    const degrees = canvas.getAllByPlaceholderText('Степень / специальность');
    await userEvent.type(degrees[degrees.length - 1], 'Магистратура');
    // Без даты начала запись не сохранить: поле подсвечено, кнопка неактивна.
    await expect(canvas.getByText('Укажите дату начала')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /Сохранить/ })).toBeDisabled();
    // Секция «Высшее» идёт первой — поле даты новой карточки по индексу её степени.
    await fireEvent.change(canvas.getAllByLabelText('Дата начала')[degrees.length - 1], {
      target: { value: '2024-09' },
    });
    await userEvent.click(canvas.getByRole('button', { name: /Сохранить/ }));
    await expect(args.onSave).toHaveBeenCalled();
  },
};

/** Окончание раньше начала — поле подсвечено ошибкой, сохранить такую запись нельзя. */
export const InvalidPeriod: Story = {
  name: 'Ошибка периода',
  args: {
    rows: buildRows(mockEducationAdmin, 'ru').map((row) =>
      row.id === 'mslu' ? { ...row, endMonth: '2010-01' } : row,
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Окончание раньше начала')).toBeInTheDocument();
  },
};

/** Английская локаль — те же записи в переводе. */
export const English: Story = {
  name: 'Локаль EN',
  args: { rows: buildRows(mockEducationAdmin, 'en') },
};

/** Пустой список — только кнопки добавления в обеих секциях. */
export const Empty: Story = {
  name: 'Пусто',
  args: { rows: [] },
};

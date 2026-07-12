import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ConfirmDialog } from './confirm-dialog';

const meta = {
  title: 'Shared/components/ConfirmDialog',
  component: ConfirmDialog,
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
  args: {
    open: true,
    title: 'Удалить статью?',
    message: 'Статью «Хуки React» нельзя будет восстановить.',
    confirmLabel: 'Удалить',
    cancelLabel: 'Отмена',
    busy: false,
    onConfirm: fn(),
    onCancel: fn(),
  },
  argTypes: {
    open: { control: 'boolean', table: { category: 'Состояние' } },
    busy: { control: 'boolean', table: { category: 'Состояние' } },
    title: { control: 'text', table: { category: 'Контент' } },
    message: { control: 'text', table: { category: 'Контент' } },
    confirmLabel: { control: 'text', table: { category: 'Контент' } },
    cancelLabel: { control: 'text', table: { category: 'Контент' } },
    onConfirm: { control: false, table: { category: 'События' } },
    onCancel: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Подтверждение удаления: иконка-корзина, пояснение, красная «Удалить». */
export const Default: Story = {
  name: 'Удаление',
};

/** Операция в процессе — кнопки заблокированы. */
export const Busy: Story = {
  name: 'В процессе',
  args: { busy: true },
};

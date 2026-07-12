import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { ChangePasswordForm } from './ui/change-password-form';

const meta = {
  title: 'Widgets/AdminSettings/ChangePasswordForm',
  component: ChangePasswordForm,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: { isSaving: false, onSubmit: fn() },
  argTypes: {
    isSaving: { control: 'boolean', table: { category: 'Состояние' } },
    onSubmit: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof ChangePasswordForm>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Форма смены пароля: текущий + новый + подтверждение. */
export const Default: Story = {
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Текущий пароль'), 'admin12345');
    await userEvent.type(canvas.getByLabelText('Новый пароль'), 'newsecret123');
    await userEvent.type(canvas.getByLabelText('Повторите новый пароль'), 'newsecret123');
    await userEvent.click(canvas.getByRole('button', { name: 'Сменить пароль' }));
    await expect(args.onSubmit).toHaveBeenCalled();
  },
};

/** Идёт сохранение — кнопка заблокирована. */
export const Saving: Story = {
  name: 'Сохранение',
  args: { isSaving: true },
};

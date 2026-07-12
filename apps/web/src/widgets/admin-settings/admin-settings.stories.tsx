import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { mockSettings } from '@/entities/settings/mocks';

import { AdminSettingsView } from './ui/admin-settings-view';

const meta = {
  title: 'Widgets/AdminSettings',
  component: AdminSettingsView,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: {
    settings: mockSettings,
    isSaving: false,
    onSave: fn(),
  },
  argTypes: {
    settings: { control: false, table: { category: 'Данные' } },
    isSaving: { control: 'boolean', table: { category: 'Состояние' } },
    onSave: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof AdminSettingsView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Настройки сайта',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Light' }));
    await userEvent.click(canvas.getByRole('button', { name: /Сохранить/ }));
    await expect(args.onSave).toHaveBeenCalled();
  },
};

export const Saving: Story = {
  name: 'Сохранение',
  args: { isSaving: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Бар сохранения появляется только при изменениях — правим, затем проверяем,
    // что во время сохранения «Сохранить» заблокирована.
    await userEvent.click(canvas.getByRole('radio', { name: 'Light' }));
    await expect(canvas.getByRole('button', { name: /Сохранить/ })).toBeDisabled();
  },
};

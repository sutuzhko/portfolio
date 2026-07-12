import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { AdminPageView } from './ui/admin-page-view';

const tabs = [
  { id: 'profile', label: 'Профиль', icon: 'user' as const },
  { id: 'projects', label: 'Проекты', icon: 'folder' as const },
  { id: 'settings', label: 'Настройки', icon: 'edit' as const },
];

const meta = {
  title: 'Pages/Admin',
  component: AdminPageView,
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
  args: {
    tabs,
    activeTab: 'profile',
    activeLabel: 'Профиль',
    onTabChange: fn(),
    onBack: fn(),
    children: (
      <div style={{ padding: 22, border: '1px dashed var(--color-border)', borderRadius: 12 }}>
        Контент активной вкладки
      </div>
    ),
  },
  argTypes: {
    tabs: { control: false, table: { category: 'Данные' } },
    activeTab: { control: 'text', table: { category: 'Состояние' } },
    onTabChange: { control: false, table: { category: 'События' } },
    onBack: { control: false, table: { category: 'События' } },
    children: { control: false, table: { category: 'Слоты' } },
  },
} satisfies Meta<typeof AdminPageView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Оболочка кабинета',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Настройки' }));
    await expect(args.onTabChange).toHaveBeenCalledWith('settings');
  },
};

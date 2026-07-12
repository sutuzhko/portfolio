import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ServerErrorPage } from './ui/server-error-page';

const meta = {
  title: 'Pages/ServerError',
  component: ServerErrorPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ServerErrorPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Ошибка сервера',
  play: async ({ canvas }) => {
    await expect(canvas.getByText('500')).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'На главную' })).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { expect } from 'storybook/test';

import { ForbiddenPage } from './ui/forbidden-page';

const meta = {
  title: 'Pages/Forbidden',
  component: ForbiddenPage,
  parameters: { layout: 'fullscreen' },
  // Ссылка «на главную» использует роутер — даём контекст истории.
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof ForbiddenPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Доступ запрещён',
  play: async ({ canvas }) => {
    await expect(canvas.getByText('403')).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'На главную' })).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

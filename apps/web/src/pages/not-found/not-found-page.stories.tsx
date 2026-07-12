import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { expect } from 'storybook/test';

import { NotFoundPage } from './ui/not-found-page';

const meta = {
  title: 'Pages/NotFound',
  component: NotFoundPage,
  parameters: { layout: 'fullscreen' },
  // Ссылка «на главную» использует роутер — даём контекст истории.
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof NotFoundPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Страница не найдена',
  play: async ({ canvas }) => {
    await expect(canvas.getByText('404')).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'На главную' })).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

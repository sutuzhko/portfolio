import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { ProfileContact } from '@/entities/profile';

import { ContactLinks } from './ui/contact-links';

const contacts: ProfileContact[] = [
  { icon: 'telegram', url: 'https://t.me/sutuzhko' },
  { icon: 'email', url: 'mailto:julfy.web@gmail.com' },
  { icon: 'github', url: 'https://github.com/sutuzhko' },
  { icon: 'codewars', url: 'https://www.codewars.com/users/sutuzhko' },
];

const meta = {
  title: 'Widgets/ContactLinks',
  component: ContactLinks,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: { contacts, isLoading: false },
  argTypes: {
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    contacts: { control: 'object', table: { category: 'Данные' } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}>{Story()}</div>],
} satisfies Meta<typeof ContactLinks>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Карточки каналов. play: название + очищенное значение ссылки; email — в почте, не в новой вкладке. */
export const Loaded: Story = {
  name: 'С данными',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Telegram')).toBeInTheDocument();
    await expect(canvas.getByText('t.me/sutuzhko')).toBeInTheDocument();

    const links = canvas.getAllByRole('link');
    const mailto = links.find((link) => link.getAttribute('href')?.startsWith('mailto:'));
    const external = links.find((link) => link.getAttribute('href')?.startsWith('https://t.me'));
    // Внешняя ссылка открывается в новой вкладке, email (mailto) — нет.
    await expect(external).toHaveAttribute('target', '_blank');
    await expect(mailto).not.toHaveAttribute('target');
  },
};

/** Профиль грузится — скелетон-плитки той же высоты. */
export const Loading: Story = {
  name: 'Ожидание данных (isLoading)',
  args: { isLoading: true },
};

/** Край: единственный канал — сетка не растягивает карточку. */
export const SingleChannel: Story = {
  name: 'Край: один канал',
  args: { contacts: [{ icon: 'telegram', url: 'https://t.me/sutuzhko' }] },
};

/** Мобильная раскладка: сетка в один столбец. */
export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

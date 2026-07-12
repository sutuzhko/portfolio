import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import type { ProfileContact } from '@/entities/profile';

import { ContactPageView } from './ui/contact-page-view';

const contacts: ProfileContact[] = [
  { icon: 'telegram', url: 'https://t.me/sutuzhko' },
  { icon: 'email', url: 'mailto:julfy.web@gmail.com' },
  { icon: 'github', url: 'https://github.com/sutuzhko' },
  { icon: 'codewars', url: 'https://www.codewars.com/users/sutuzhko' },
];

const meta = {
  title: 'Pages/Contact',
  component: ContactPageView,
  parameters: { layout: 'fullscreen' },
  args: {
    contacts,
    intro:
      'Открыт к интересным задачам и предложениям. Пишите в любой из каналов — отвечаю быстро.',
    cvUrl: '/uploads/cv/Bogdan_Sutuzhko_CV.pdf',
    isLoading: false,
    isError: false,
    onBack: () => undefined,
    onRetry: () => undefined,
    onDownloadCv: fn(),
  },
  argTypes: {
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    isError: { control: 'boolean', table: { category: 'Состояние' } },
    contacts: { control: 'object', table: { category: 'Данные' } },
    intro: { control: 'text', table: { category: 'Данные' } },
    cvUrl: { control: 'text', table: { category: 'Данные' } },
    onBack: { control: false, table: { disable: true } },
    onRetry: { control: false, table: { disable: true } },
    onDownloadCv: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof ContactPageView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  name: 'С данными',
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Свяжитесь со мной' })).toBeInTheDocument();
    const download = canvas.getByRole('button', { name: /Скачать резюме/ });
    await userEvent.click(download);
    await expect(args.onDownloadCv).toHaveBeenCalled();
  },
};

export const Loading: Story = {
  name: 'Ожидание данных',
  // Данных ещё нет: contacts/cvUrl грузятся, intro профиля тоже undefined → всё под скелетоном.
  args: { isLoading: true, intro: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Интро без данных (undefined) — под скелетоном, не текстом.
    await expect(canvas.queryByText(/Открыт к интересным задачам/)).not.toBeInTheDocument();
  },
};

export const Failed: Story = {
  name: 'Ошибка загрузки',
  args: { isError: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

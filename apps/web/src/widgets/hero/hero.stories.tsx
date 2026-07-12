import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import type { Profile } from '@/entities/profile';

import { Hero } from './ui/hero';

const profile: Profile = {
  name: 'Bogdan Sutuzhko',
  roleTitle: 'Full Stack Developer',
  location: 'Moscow, Russia',
  email: 'julfy.web@gmail.com',
  avatarPhotoUrl: null,
  avatarColor: '#238636',
  heroStack: ['React', 'Vue 3', 'Next.js', 'Node · NestJS', 'TypeScript'],
  availability: 'ACTIVE',
  cvUrl: '/uploads/cv/Bogdan_Sutuzhko_CV.pdf',
  highlights: [],
  headline: 'Инженер фронтенда с продуктовым мышлением.',
  bioMarkdown: 'Инженер фронтенда с продуктовым мышлением.',
  projectsIntro: null,
  experienceIntro: null,
  contactIntro: null,
  contacts: [],
};

const meta = {
  title: 'Widgets/Hero',
  component: Hero,
  parameters: { layout: 'fullscreen' },
  args: {
    profile,
    isLoading: false,
    onOpenConsole: fn(),
    onDownloadCv: fn(),
    onProjects: fn(),
    onContact: fn(),
  },
  argTypes: {
    profile: { control: false, table: { category: 'Данные' } },
    onOpenConsole: { control: false, table: { category: 'События' } },
    onDownloadCv: { control: false, table: { category: 'События' } },
    onProjects: { control: false, table: { category: 'События' } },
    onContact: { control: false, table: { category: 'События' } },
    isLoading: {
      control: 'boolean',
      description: 'Показывает скелетон идентичности (остальное статично).',
      table: { category: 'Состояние' },
    },
  },
  decorators: [(Story) => <div style={{ padding: 'var(--space-6)' }}>{Story()}</div>],
} satisfies Meta<typeof Hero>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Полный герой. play: идентичность, печатающая строка и все три CTA + плашка консоли. */
export const Playground: Story = {
  play: async ({ canvasElement, userEvent, args, step }) => {
    const canvas = within(canvasElement);
    await step('Показаны имя, роль и печатающая строка', async () => {
      await expect(canvas.getByRole('heading', { name: 'Bogdan Sutuzhko' })).toBeInTheDocument();
      await expect(canvas.getByText(/Full Stack Developer/)).toBeInTheDocument();
      await expect(canvas.getByText('Сейчас пишу на')).toBeInTheDocument();
    });
    await step('CTA вызывают свои обработчики', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Скачать резюме' }));
      await expect(args.onDownloadCv).toHaveBeenCalledOnce();
      await userEvent.click(canvas.getByRole('button', { name: 'Проекты' }));
      await expect(args.onProjects).toHaveBeenCalledOnce();
      await userEvent.click(canvas.getByRole('button', { name: 'Связаться' }));
      await expect(args.onContact).toHaveBeenCalledOnce();
    });
    await step('Плашка терминала открывает консоль', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /Консоль/ }));
      await expect(args.onOpenConsole).toHaveBeenCalledOnce();
    });
  },
};

/** Контент профиля под скелетоном; CTA и терминал доступны сразу. */
export const Loading: Story = {
  name: 'Скелетон загрузки контента',
  args: { isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('heading')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Сейчас пишу на')).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Скачать резюме' })).toBeInTheDocument();
  },
};

/** С фотографией вместо инициалов. */
export const WithPhoto: Story = {
  name: 'С фотографией',
  args: {
    profile: { ...profile, avatarPhotoUrl: 'https://avatars.githubusercontent.com/u/1?v=4' },
  },
};

/** Мобильная раскладка: колонки складываются в стопку. */
export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

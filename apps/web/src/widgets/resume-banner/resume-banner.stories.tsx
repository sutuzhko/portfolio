import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { ResumeBanner } from './ui/resume-banner';

const meta = {
  title: 'Widgets/ResumeBanner',
  component: ResumeBanner,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: {
    cvUrl: '/uploads/cv/Bogdan_Sutuzhko_CV.pdf',
    isLoading: false,
    onDownload: fn(),
  },
  argTypes: {
    cvUrl: {
      control: 'text',
      description: 'Ссылка на PDF-резюме. Пусто → скелетон, отсутствует → баннер скрыт.',
      table: { category: 'Данные' },
    },
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    onDownload: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-page)' }}>{Story()}</div>],
} satisfies Meta<typeof ResumeBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  name: 'С резюме',
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Скачать резюме/ });
    await userEvent.click(button);
    await expect(args.onDownload).toHaveBeenCalled();
  },
};

export const Loading: Story = {
  name: 'Загрузка (скелетон)',
  args: { isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // В состоянии загрузки кнопки нет — только скелетон-заглушки.
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const NoResume: Story = {
  name: 'Без резюме (null)',
  args: { cvUrl: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Баннер скрыт целиком — ни кнопки, ни заголовка.
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

/** Скачивание доступно с клавиатуры: Tab → фокус, Enter вызывает onDownload. */
export const KeyboardDownload: Story = {
  name: 'Скачивание с клавиатуры',
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Скачать резюме/ });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onDownload).toHaveBeenCalled();
  },
};

export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

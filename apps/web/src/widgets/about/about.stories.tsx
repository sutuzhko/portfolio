import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { About } from './ui/about';

const SAMPLE_BIO = [
  'Меня зовут Богдан Сутужко, и я Fullstack-разработчик. Это моя страсть, которая стала профессией. Люблю создавать красивые и полезные продукты.',
  'Сейчас фронтенд-разработчик в [Go Mobile](https://gomobile.ru) — строю внутренние продукты и корпоративный UI-kit. До этого вёл ключевые фичи [Procharity](https://procharity.ru).',
  'В свободное время веду проект **Deep Focus** вместе с [@gvozdenkov](https://github.com/gvozdenkov).',
].join('\n\n');

const meta = {
  title: 'Widgets/About',
  component: About,
  parameters: { layout: 'padded' },
  args: { bioMarkdown: SAMPLE_BIO },
  argTypes: {
    bioMarkdown: { control: 'text', table: { category: 'Контент' } },
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-page)' }}>{Story()}</div>],
} satisfies Meta<typeof About>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Био в Markdown. play: заголовок секции + ссылка открывается в новой вкладке. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: '// обо мне' })).toBeInTheDocument();
    const link = canvas.getByRole('link', { name: 'Go Mobile' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  },
};

/** Профиль грузится — три скелетон-абзаца (высота строк = line-box). */
export const Loading: Story = {
  name: 'Скелетон загрузки',
  args: { isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
  },
};

/** Край: короткое био из одного абзаца без ссылок. */
export const ShortBio: Story = {
  name: 'Край: короткое био',
  args: { bioMarkdown: 'Fullstack-разработчик. React, Vue, Node.' },
};

/** Мобильная раскладка: абзацы занимают всю ширину. */
export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { PageIntro } from './page-intro';

const sample =
  'Коммерческие продукты и pet-проекты, над которыми я работал. Фильтруйте по стеку и участникам, чтобы найти нужное.';

const meta = {
  title: 'Shared/components/PageIntro',
  component: PageIntro,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: { intro: sample },
  argTypes: {
    intro: {
      control: 'text',
      description:
        'Текст интро (серверное поле). `undefined` → скелетон, `null` → ничего, строка → абзац.',
      table: { category: 'Контент' },
    },
    className: { control: false, table: { disable: true } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-page)' }}>{Story()}</div>],
} satisfies Meta<typeof PageIntro>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Строка → абзац под заголовком экрана. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(sample)).toBeInTheDocument();
  },
};

/** `undefined` → скелетон из двух строк (высота = высота абзаца, без скачка вёрстки). */
export const Loading: Story = {
  name: 'Загрузка (скелетон)',
  args: { intro: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(sample)).not.toBeInTheDocument();
  },
};

/** `null` → интро для экрана нет, ничего не рендерится. */
export const Empty: Story = {
  name: 'Без интро (null)',
  args: { intro: null },
  play: async ({ canvasElement }) => {
    // Пустой рендер: в области истории нет текста абзаца.
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(sample)).not.toBeInTheDocument();
  },
};

/** Край: длинное интро переносится в несколько строк без ограничения по высоте. */
export const LongIntro: Story = {
  name: 'Край: длинное интро',
  args: {
    intro:
      'Здесь собраны и коммерческие продукты, и учебные pet-проекты за несколько лет. Каждый проект можно открыть, посмотреть стек, участников, ссылки и, где это возможно, запустить прямо в браузере. Пользуйтесь поиском и фильтрами по технологиям и участникам, чтобы быстро найти нужное.',
  },
};

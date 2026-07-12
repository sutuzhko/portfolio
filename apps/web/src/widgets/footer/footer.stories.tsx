import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Footer } from './ui/footer';

const meta = {
  title: 'Widgets/Footer',
  component: Footer,
  parameters: { layout: 'fullscreen' },
  args: { owner: 'Bogdan Sutuzhko' },
  argTypes: {
    owner: {
      control: 'text',
      description: 'Имя владельца для копирайта (из профиля). `undefined` → скелетон.',
      table: { category: 'Контент' },
    },
    className: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Footer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Копирайт + подсказка консоли. play: подвал — landmark contentinfo с именем и ярлыком. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('contentinfo')).toBeInTheDocument();
    await expect(canvas.getByText(/Bogdan Sutuzhko/)).toBeInTheDocument();
    // На десктопе (есть клавиатура) видна подсказка с ярлыком консоли (…K).
    await expect(canvas.getByText(/K$/)).toBeInTheDocument();
  },
};

/** Имя ещё грузится — на месте копирайта скелетон. */
export const Loading: Story = {
  name: 'Имя грузится (скелетон)',
  args: { owner: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(/Bogdan Sutuzhko/)).not.toBeInTheDocument();
  },
};

/** Край: длинное имя владельца не наезжает на подсказку (перенос строк). */
export const LongOwner: Story = {
  name: 'Край: длинное имя',
  args: { owner: 'Александра-Виктория Мидлтон-Сазерленд' },
};

/** Мобильная ширина: строки переносятся, отступы ужимаются. */
export const Mobile: Story = {
  name: 'Мобильная ширина (320px)',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { TerminalCard } from './ui/terminal-card';

const meta = {
  title: 'Widgets/Hero/TerminalCard',
  component: TerminalCard,
  parameters: { layout: 'centered' },
  args: { onOpenConsole: fn() },
  argTypes: {
    onOpenConsole: { control: false, table: { category: 'События' } },
  },
  decorators: [(Story) => <div style={{ width: 380 }}>{Story()}</div>],
} satisfies Meta<typeof TerminalCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** «Терминальная» визитка. play: виден вывод; клик по плашке открывает консоль. */
export const Playground: Story = {
  play: async ({ canvasElement, userEvent, args, step }) => {
    const canvas = within(canvasElement);
    await step('Виден вывод терминала', async () => {
      await expect(canvas.getByText('whoami')).toBeInTheDocument();
      await expect(canvas.getByText(/React · Vue 3 · Node · TypeScript/)).toBeInTheDocument();
    });
    await step('Клик по плашке открывает консоль', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /Консоль/ }));
      await expect(args.onOpenConsole).toHaveBeenCalledOnce();
    });
  },
};

/** Мобильная ширина: карточка ужимается по контейнеру. */
export const Mobile: Story = {
  name: 'Мобильная ширина',
  decorators: [(Story) => <div style={{ width: 300 }}>{Story()}</div>],
};

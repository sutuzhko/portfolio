import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { DockPill } from './dock-pill';

const meta = {
  title: 'Shared/components/DockPill',
  component: DockPill,
  parameters: { layout: 'centered', controls: { expanded: true } },
  args: {
    label: 'bash — ~',
    onClose: fn(),
    onRestore: fn(),
    onMaximize: fn(),
    closeLabel: 'Закрыть',
    restoreLabel: 'Развернуть',
    maximizeLabel: 'На всю ширину',
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Контент' } },
    closeLabel: { control: 'text', table: { category: 'Доступность' } },
    restoreLabel: { control: 'text', table: { category: 'Доступность' } },
    maximizeLabel: { control: 'text', table: { category: 'Доступность' } },
    onClose: { control: false, table: { disable: true } },
    onRestore: { control: false, table: { disable: true } },
    onMaximize: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof DockPill>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. play: клик по подписи разворачивает окно (onRestore). */
export const Playground: Story = {
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'bash — ~' }));
    await expect(args.onRestore).toHaveBeenCalled();
  },
};

/** Пилюля раннера — та же пилюля с другой подписью. */
export const Runner: Story = {
  name: 'Раннер',
  args: { label: '2048 — game' },
};

/** Клик по «светофору»: красный закрывает, зелёный разворачивает на всю ширину. */
export const Controls: Story = {
  name: 'Светофор',
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'На всю ширину' }));
    await expect(args.onMaximize).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Закрыть' }));
    await expect(args.onClose).toHaveBeenCalled();
  },
};

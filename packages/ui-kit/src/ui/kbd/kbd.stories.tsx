import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Kbd } from './kbd';

const meta = {
  title: 'Shared/primitives/Kbd',
  component: Kbd,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: { children: 'Esc' },

  argTypes: {
    children: { control: 'text', table: { category: 'Контент' } },
  },
} satisfies Meta<typeof Kbd>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. play проверяет, что рендерится семантический `<kbd>`. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const key = canvas.getByText('Esc');
    await expect(key.tagName).toBe('KBD');
  },
};

/** Одна клавиша. */
export const Single: Story = {
  name: 'Одна клавиша',
  args: { children: 'Enter' },
};

/** Сочетание: каждая клавиша — отдельный `Kbd`, вид как у реальных клавиш. */
export const Combo: Story = {
  name: 'Сочетание клавиш',
  render: () => (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </span>
  ),
};

/** Последовательность (сначала одна, потом другая) — с разделителем «затем». */
export const Sequence: Story = {
  name: 'Последовательность',
  render: () => (
    <span
      style={{
        display: 'inline-flex',
        gap: 6,
        alignItems: 'center',
        color: 'var(--color-fg-muted)',
        fontSize: 13,
      }}
    >
      <Kbd>G</Kbd> затем <Kbd>H</Kbd>
    </span>
  ),
};

/** Обзор набора клавиш разной ширины. */
export const Keys: Story = {
  name: 'Разные клавиши',
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 360 }}>
      {['⌘', '⇧', '⌥', '⌃', 'Enter', 'Esc', 'Tab', '↑', '↓', 'Space', 'Backspace'].map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
    </div>
  ),
};

/** В контексте: строка подсказки «открыть консоль». */
export const InContext: Story = {
  name: 'В контексте: подсказка',
  render: () => (
    <span
      style={{
        display: 'inline-flex',
        gap: 6,
        alignItems: 'center',
        color: 'var(--color-fg-muted)',
        fontSize: 13,
      }}
    >
      Открыть консоль <Kbd>⌘</Kbd> <Kbd>K</Kbd>
    </span>
  ),
};

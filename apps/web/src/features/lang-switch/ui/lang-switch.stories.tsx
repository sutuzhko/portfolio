import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { LangSwitch } from './lang-switch';

const meta = {
  title: 'Features/LangSwitch',
  component: LangSwitch,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof LangSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Клик циклит локаль ru ↔ en. Язык глобальный — кликаем дважды, возвращая исходную
 * локаль, чтобы не «протечь» в соседние истории.
 */
export const Playground: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    const initial = button.textContent;

    await userEvent.click(button);
    await expect(button.textContent).not.toBe(initial);

    await userEvent.click(button);
    await expect(button.textContent).toBe(initial);
  },
};

/** В контексте: код локали моноширинным шрифтом в блоке навбара. */
export const InContext: Story = {
  name: 'В контексте: блок навбара',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        padding: 8,
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
      }}
    >
      <LangSwitch />
    </div>
  ),
};

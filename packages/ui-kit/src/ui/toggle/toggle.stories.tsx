import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';

import { Toggle } from './toggle';

const meta = {
  title: 'Shared/primitives/Toggle',
  component: Toggle,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: { 'aria-label': 'Видимость', checked: false },

  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Включён ли переключатель (отражается в aria-checked).',
      table: { category: 'Состояние', defaultValue: { summary: 'false' } },
    },
    compact: {
      control: 'boolean',
      description: 'Компактный размер (38×22) для флагов в формах.',
      table: { category: 'Оформление', defaultValue: { summary: 'false' } },
    },
    disabled: { control: 'boolean', table: { category: 'Состояние' } },
    onCheckedChange: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. */
export const Playground: Story = {};

/** Все состояния сразу: выкл/вкл × обычный/компактный × недоступный. */
export const States: Story = {
  name: 'Все состояния',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Toggle aria-label="выкл" checked={false} />
        <Toggle aria-label="вкл" checked />
        <Toggle aria-label="выкл компактный" compact checked={false} />
        <Toggle aria-label="вкл компактный" compact checked />
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', opacity: 0.99 }}>
        <Toggle aria-label="недоступен выкл" disabled />
        <Toggle aria-label="недоступен вкл" disabled checked />
      </div>
    </div>
  ),
};

/** Выключен. */
export const Off: Story = {
  name: 'Выключен',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  },
};

/** Включён. */
export const On: Story = {
  name: 'Включён',
  args: { checked: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  },
};

/** Компактный размер для флагов в формах. */
export const Compact: Story = {
  name: 'Компактный',
  args: { compact: true, checked: true },
};

/** Недоступен. */
export const Disabled: Story = {
  name: 'Недоступен',
  args: { disabled: true },
};

/** Живое переключение мышью. */
export const Toggling: Story = {
  name: 'Переключение (живое)',
  render: (args) => {
    const [on, setOn] = useState(false);
    return <Toggle {...args} checked={on} onCheckedChange={setOn} />;
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  },
};

/** Активация с клавиатуры: Tab → фокус, Пробел переключает. */
export const KeyboardActivation: Story = {
  name: 'Активация с клавиатуры',
  render: (args) => {
    const [on, setOn] = useState(false);
    return <Toggle {...args} checked={on} onCheckedChange={setOn} />;
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  },
};

/**
 * В контексте: строка настройки. Видимый текст — доступное имя через
 * `aria-labelledby` (у кнопки-switch нет `label[for]`).
 */
export const WithLabel: Story = {
  name: 'В контексте: строка настройки',
  render: (args) => {
    const [on, setOn] = useState(true);
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span id="toggle-setting-label" style={{ color: 'var(--color-fg)' }}>
          Показывать активность
        </span>
        <Toggle
          {...args}
          aria-labelledby="toggle-setting-label"
          checked={on}
          onCheckedChange={setOn}
        />
      </div>
    );
  },
};

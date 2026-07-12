import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, within } from 'storybook/test';

import { Chip } from './chip';

const meta = {
  title: 'Shared/primitives/Chip',
  component: Chip,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: { children: 'React', selected: false, onClick: fn() },

  argTypes: {
    selected: {
      control: 'boolean',
      description: 'Выбран ли фильтр. Отражается в aria-pressed и зелёной заливке.',
      table: { category: 'Состояние', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Недоступный фильтр: не реагирует на клик, вне tab-порядка.',
      table: { category: 'Состояние', defaultValue: { summary: 'false' } },
    },
    children: { control: 'text', table: { category: 'Контент' } },
    onClick: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. play: тоггл начинает с aria-pressed=false и вызывает onClick по клику. */
export const Playground: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: 'React' });
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(chip);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

/** Галерея всех состояний сразу: выбран/не выбран × доступен/недоступен. */
export const States: Story = {
  name: 'Все состояния',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Chip>не выбран</Chip>
      <Chip selected>выбран</Chip>
      <Chip disabled>недоступен</Chip>
      <Chip selected disabled>
        выбран + недоступен
      </Chip>
    </div>
  ),
};

/** Живое переключение: клик реально меняет aria-pressed (состояние живёт снаружи). */
export const Toggling: Story = {
  name: 'Переключение (живое)',
  render: (args) => {
    const [on, setOn] = useState(false);
    return (
      <Chip {...args} selected={on} onClick={() => setOn((value) => !value)}>
        TypeScript
      </Chip>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: 'TypeScript' });
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  },
};

/** Активация с клавиатуры: Tab → фокус, Пробел переключает. */
export const KeyboardActivation: Story = {
  name: 'Активация с клавиатуры',
  render: (args) => {
    const [on, setOn] = useState(false);
    return (
      <Chip {...args} selected={on} onClick={() => setOn((value) => !value)}>
        node
      </Chip>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: 'node' });
    await userEvent.tab();
    await expect(chip).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  },
};

/** Недоступный чип не вызывает onClick. */
export const Disabled: Story = {
  name: 'Недоступен',
  args: { disabled: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: 'React' });
    await expect(chip).toBeDisabled();
    await userEvent.click(chip);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** В контексте: панель фильтров с множественным выбором. */
export const FilterGroup: Story = {
  name: 'В контексте: группа фильтров',
  parameters: { controls: { disable: true } },
  render: () => {
    const [active, setActive] = useState<ReadonlySet<string>>(new Set(['react']));
    const toggle = (id: string): void =>
      setActive((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 340 }}>
        {['react', 'typescript', 'node', 'docker', 'vite', 'redux'].map((id) => (
          <Chip key={id} selected={active.has(id)} onClick={() => toggle(id)}>
            {id}
          </Chip>
        ))}
      </div>
    );
  },
};

/** Край: длинное значение фильтра. */
export const LongLabel: Story = {
  name: 'Край: длинное значение',
  args: { children: 'server-side-rendering', selected: true },
};

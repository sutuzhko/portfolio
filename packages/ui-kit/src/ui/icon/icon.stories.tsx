import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Icon } from './icon';
import { iconRegistry, type IconName } from './icon-paths';

const meta = {
  title: 'Shared/primitives/Icon',
  component: Icon,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: { name: 'search', size: 24 },

  argTypes: {
    name: {
      control: 'select',
      options: Object.keys(iconRegistry),
      description: 'Имя иконки из реестра дизайн-системы.',
      table: { category: 'Контент' },
    },
    size: {
      control: { type: 'range', min: 12, max: 64, step: 2 },
      description: 'Размер квадрата в px (по умолчанию 18).',
      table: { category: 'Оформление', defaultValue: { summary: '18' } },
    },
    title: {
      control: 'text',
      description:
        'Доступная подпись. С ней иконка — role=img, без неё — декоративная (aria-hidden).',
      table: { category: 'Доступность' },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница: выберите иконку и размер, задайте title для значимого варианта. */
export const Playground: Story = {};

/** По умолчанию иконка декоративна (`aria-hidden`) — рядом обычно есть текст. */
export const Decorative: Story = {
  name: 'Декоративная (по умолчанию)',
  args: { name: 'folder' },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg');
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
  },
};

/** С `title` иконка становится значимой: `role="img"` + доступное имя. */
export const Meaningful: Story = {
  name: 'Значимая (с подписью)',
  args: { name: 'warning', title: 'Внимание' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Внимание' })).toBeInTheDocument();
  },
};

/** Размер — квадрат в px; масштабируется без потери чёткости (это SVG). */
export const Sizes: Story = {
  name: 'Размеры',
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: 'var(--color-fg)' }}>
      {[12, 16, 18, 24, 32, 48].map((size) => (
        <Icon key={size} name="star" size={size} />
      ))}
    </div>
  ),
};

/** Цвет наследуется через `currentColor` от свойства `color` родителя. */
export const ColorInheritance: Story = {
  name: 'Наследование цвета',
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, color: 'var(--color-primary-bright)' }}>
      <Icon {...args} name="success" />
      <span style={{ color: 'var(--color-danger)' }}>
        <Icon {...args} name="close" />
      </span>
      <span style={{ color: 'var(--color-fg-muted)' }}>
        <Icon {...args} name="info" />
      </span>
    </div>
  ),
};

/** Весь реестр — единственный источник иконок в проекте. */
export const Gallery: Story = {
  name: 'Весь реестр',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 16,
        color: 'var(--color-fg)',
      }}
    >
      {(Object.keys(iconRegistry) as IconName[]).map((name) => (
        <div key={name} style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Icon name={name} size={22} />
          <code
            style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-fg-dim)' }}
          >
            {name}
          </code>
        </div>
      ))}
    </div>
  ),
};

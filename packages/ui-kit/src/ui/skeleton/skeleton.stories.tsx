import type { Meta, StoryObj } from '@storybook/react-vite';

import { Skeleton } from './skeleton';

const meta = {
  title: 'Shared/primitives/Skeleton',
  component: Skeleton,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: { width: '240px', height: '20px' },

  argTypes: {
    width: {
      control: 'text',
      description: 'Ширина (любое CSS-значение).',
      table: { category: 'Оформление' },
    },
    height: {
      control: 'text',
      description: 'Высота (любое CSS-значение).',
      table: { category: 'Оформление' },
    },
    radius: {
      control: 'text',
      description: 'Радиус скругления; по умолчанию токен --radius-sm.',
      table: { category: 'Оформление' },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница: задайте форму под будущий контент. */
export const Playground: Story = {};

/** Строка текста. */
export const Line: Story = {
  name: 'Строка текста',
};

/** Круг под аватар. */
export const Circle: Story = {
  name: 'Круг (аватар)',
  args: { width: '64px', height: '64px', radius: 'var(--radius-pill)' },
};

/** Крупный блок под карточку/изображение. */
export const Block: Story = {
  name: 'Блок карточки',
  args: { width: '320px', height: '80px', radius: 'var(--radius-card)' },
};

/** Многострочный абзац: строки разной ширины повторяют реальный текст. */
export const TextBlock: Story = {
  name: 'Абзац текста',
  render: () => (
    <div style={{ display: 'grid', gap: 10, width: 320 }}>
      <Skeleton width="100%" height="14px" />
      <Skeleton width="92%" height="14px" />
      <Skeleton width="96%" height="14px" />
      <Skeleton width="60%" height="14px" />
    </div>
  ),
};

/** В контексте: скелетон карточки профиля повторяет её раскладку — без сдвига при загрузке. */
export const CardLayout: Story = {
  name: 'В контексте: карточка профиля',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        width: 320,
        padding: 20,
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        background: 'var(--color-surface)',
      }}
    >
      <Skeleton width="56px" height="56px" radius="var(--radius-pill)" />
      <div style={{ display: 'grid', gap: 10, flex: 1 }}>
        <Skeleton width="70%" height="16px" />
        <Skeleton width="45%" height="12px" />
      </div>
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProjectBackground } from './ui/project-background';

const meta = {
  title: 'Entities/Project/Background',
  component: ProjectBackground,
  parameters: { layout: 'centered', controls: { expanded: true } },
  args: { color: 'linear-gradient(135deg, #1d6f74, #0f3d40)' },
  argTypes: {
    color: { control: 'text', table: { category: 'Контент' } },
    className: { control: false, table: { disable: true } },
  },
  // Фон позиционируется абсолютно — даём relative-контейнер с размерами плитки.
  decorators: [
    (Story) => (
      <div
        style={{
          position: 'relative',
          width: 320,
          height: 200,
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-panel)',
        }}
      >
        {Story()}
      </div>
    ),
  ],
} satisfies Meta<typeof ProjectBackground>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница: меняйте `color` — сплошной цвет или градиент. */
export const Playground: Story = {};

/** Пресеты градиентов из макета — примеры значений `tileColor`. */
export const Presets: Story = {
  name: 'Пресеты',
  parameters: { controls: { disable: true } },
  decorators: [
    (Story) => <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>{Story()}</div>,
  ],
  render: () => (
    <>
      {[
        'linear-gradient(135deg, #1d6f74, #0f3d40)',
        'linear-gradient(135deg, #7d4bd1, #3a1d66)',
        'linear-gradient(135deg, #c2410c, #7c2d12)',
        '#30363d',
      ].map((color) => (
        <span
          key={color}
          style={{
            position: 'relative',
            width: 200,
            height: 130,
            overflow: 'hidden',
            borderRadius: 'var(--radius-panel)',
          }}
        >
          <ProjectBackground color={color} />
        </span>
      ))}
    </>
  ),
};

/** Бирюзовый. */
export const Teal: Story = {
  name: 'Бирюзовый',
  args: { color: 'linear-gradient(135deg, #1d6f74, #0f3d40)' },
};

/** Фиолетовый. */
export const Violet: Story = {
  name: 'Фиолетовый',
  args: { color: 'linear-gradient(135deg, #7d4bd1, #3a1d66)' },
};

/** Без цвета (`null`) — нейтральный токен `--color-raised`. */
export const Fallback: Story = {
  name: 'Без цвета — фолбэк',
  args: { color: null },
};

/** В контексте: затемняющий градиент снизу обеспечивает читаемость белого текста. */
export const InCard: Story = {
  name: 'В контексте: контент поверх',
  render: (args) => (
    <>
      <ProjectBackground {...args} />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 16,
          color: '#fff',
        }}
      >
        <strong style={{ fontSize: 18 }}>Deep Focus</strong>
        <span style={{ opacity: 0.85, fontSize: 13 }}>Таймер концентрации на Vue 3</span>
      </div>
    </>
  ),
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Text } from '../text';

import { Heading } from './heading';

const LEVELS = ['display', 'h1', 'h2', 'h3'] as const;
const TONES = ['default', 'muted', 'primary'] as const;

const meta = {
  title: 'Shared/primitives/Heading',
  component: Heading,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: {
    children: 'Full Stack Developer',
    level: 'h2',
    tone: 'default',
  },

  argTypes: {
    level: {
      control: 'inline-radio',
      options: LEVELS,
      description: 'Визуальный размер по типографической шкале.',
      table: { category: 'Оформление', defaultValue: { summary: 'h2' } },
    },
    tone: {
      control: 'inline-radio',
      options: TONES,
      description: 'Смысловой цвет заголовка.',
      table: { category: 'Оформление', defaultValue: { summary: 'default' } },
    },
    as: {
      control: 'inline-radio',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description: 'Семантический тег. По умолчанию выводится из level.',
      table: { category: 'Семантика' },
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. play проверяет тег по умолчанию для level=h2 → `<h2>`. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Full Stack Developer' }),
    ).toBeInTheDocument();
  },
};

/** Вся визуальная шкала. */
export const Levels: Story = {
  name: 'Вся шкала',
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <Heading level="display">display — герой-заголовок</Heading>
      <Heading level="h1">h1 — заголовок страницы</Heading>
      <Heading level="h2">h2 — заголовок раздела</Heading>
      <Heading level="h3">h3 — подзаголовок</Heading>
    </div>
  ),
};

/** Тона. */
export const Tones: Story = {
  name: 'Тона',
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {TONES.map((tone) => (
        <Heading key={tone} level="h2" tone={tone}>
          {tone}
        </Heading>
      ))}
    </div>
  ),
};

/** Исчерпывающая матрица уровень × тон. */
export const Matrix: Story = {
  name: 'Матрица: уровень × тон',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 18 }}>
      {LEVELS.map((level) => (
        <div
          key={level}
          style={{ display: 'flex', gap: 24, alignItems: 'baseline', flexWrap: 'wrap' }}
        >
          {TONES.map((tone) => (
            <Heading key={tone} level={level} tone={tone}>
              {level}/{tone}
            </Heading>
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * Ключевая возможность: визуальный размер отделён от семантики. Крупный display —
 * но в DOM это `<h2>`, чтобы не появлялся второй `h1`. play подтверждает уровень.
 */
export const SemanticVsVisual: Story = {
  name: 'Размер отдельно от семантики',
  render: () => (
    <Heading level="display" as="h2">
      Выглядит как display, а в DOM — h2
    </Heading>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 2, name: /Выглядит как display/ }),
    ).toBeInTheDocument();
  },
};

/** В контексте: шапка страницы — заголовок + приглушённый подзаголовок. */
export const InContext: Story = {
  name: 'В контексте: шапка страницы',
  render: () => (
    <div style={{ display: 'grid', gap: 8, maxWidth: 460 }}>
      <Heading level="h1">Bogdan Sutuzhko</Heading>
      <Text tone="muted">Full Stack Developer · Москва</Text>
    </div>
  ),
};

/** Край: длинный заголовок переносится, не выходя за контейнер. */
export const LongHeading: Story = {
  name: 'Край: длинный заголовок',
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
  args: {
    level: 'h1',
    children: 'Производственный портфолио-проект как витрина инженерных практик',
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Heading } from '../heading';
import { Tag } from '../tag';
import { Text } from '../text';

import { Card } from './card';

const meta = {
  title: 'Shared/primitives/Card',
  component: Card,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: { children: 'Содержимое карточки', padding: 'md' },

  argTypes: {
    padding: {
      control: 'inline-radio',
      options: ['none', 'md', 'lg'],
      description: 'Внутренний отступ карточки.',
      table: { category: 'Оформление', defaultValue: { summary: 'md' } },
    },
    interactive: {
      control: 'boolean',
      description: 'Hover-подъём для кликабельных карточек (только визуал, не семантика).',
      table: { category: 'Оформление', defaultValue: { summary: 'false' } },
    },
    children: { control: false, table: { category: 'Контент' } },
  },

  decorators: [(Story) => <div style={{ width: 360 }}>{Story()}</div>],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. */
export const Playground: Story = {};

/** Все отступы сразу. */
export const Paddings: Story = {
  name: 'Отступы',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card padding="none">
        <div style={{ padding: 8 }}>padding: none</div>
      </Card>
      <Card padding="md">padding: md</Card>
      <Card padding="lg">padding: lg</Card>
    </div>
  ),
};

/**
 * `interactive` даёт только hover-подъём. play подтверждает: сама по себе карточка
 * не кнопка и не ссылка — семантику клика добавляет потребитель.
 */
export const Interactive: Story = {
  name: 'Интерактивная (hover)',
  args: { interactive: true, children: 'Наведите курсор' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
  },
};

/** Правильный кликабельный паттерн: ссылка заполняет карточку целиком. */
export const InteractiveLink: Story = {
  name: 'Кликабельная (со ссылкой)',
  parameters: { controls: { disable: true } },
  render: () => (
    <Card interactive padding="none">
      <a
        href="#project"
        style={{
          display: 'block',
          padding: 16,
          color: 'var(--color-fg)',
          textDecoration: 'none',
        }}
      >
        <Heading level="h3">Portfolio API</Heading>
        <Text tone="muted" size="small">
          Кликабельна вся карточка — семантику даёт вложенная ссылка.
        </Text>
      </a>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: /Portfolio API/ })).toBeInTheDocument();
  },
};

/** В контексте: карточка проекта. */
export const Composed: Story = {
  name: 'В контексте: карточка проекта',
  args: {
    children: (
      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Heading level="h3">Portfolio API</Heading>
          <Tag tone="tinted">commercial</Tag>
        </div>
        <Text tone="muted" size="small">
          NestJS · Prisma · PostgreSQL — приватная зона и админ-API портфолио.
        </Text>
        <div style={{ display: 'flex', gap: 6 }}>
          <Tag>NestJS</Tag>
          <Tag>Prisma</Tag>
          <Tag shape="pill">+3</Tag>
        </div>
      </div>
    ),
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Icon } from '../icon';

import { Tag } from './tag';

const SHAPES = ['rounded', 'pill'] as const;
const TONES = ['neutral', 'tinted'] as const;

const meta = {
  title: 'Shared/primitives/Tag',
  component: Tag,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: { children: 'TypeScript', shape: 'rounded', tone: 'neutral' },

  argTypes: {
    shape: {
      control: 'inline-radio',
      options: SHAPES,
      description: 'Форма: rounded — метка, pill — счётчик/бейдж-«таблетка».',
      table: { category: 'Оформление', defaultValue: { summary: 'rounded' } },
    },
    tone: {
      control: 'inline-radio',
      options: TONES,
      description: 'Тон: neutral — обычная метка, tinted — подкрашенный статус (`--tag-tint`).',
      table: { category: 'Оформление', defaultValue: { summary: 'neutral' } },
    },
    children: { control: 'text', table: { category: 'Контент' } },
  },
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. play подтверждает главное свойство: это `<span>`, а не кнопка — метка read-only. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('TypeScript')).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

/** Две формы рядом. */
export const Shapes: Story = {
  name: 'Формы',
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Tag {...args} shape="rounded">
        rounded
      </Tag>
      <Tag {...args} shape="pill">
        pill
      </Tag>
    </div>
  ),
};

/** Два тона рядом. */
export const Tones: Story = {
  name: 'Тона',
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Tag {...args} tone="neutral">
        neutral
      </Tag>
      <Tag {...args} tone="tinted">
        tinted
      </Tag>
    </div>
  ),
};

/** Исчерпывающая матрица форма × тон — все четыре комбинации сразу. */
export const Matrix: Story = {
  name: 'Матрица: форма × тон',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {SHAPES.map((shape) => (
        <div key={shape} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {TONES.map((tone) => (
            <Tag key={tone} shape={shape} tone={tone}>
              {shape} · {tone}
            </Tag>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** С иконкой: featured-бейдж. */
export const WithIcon: Story = {
  name: 'С иконкой',
  args: {
    tone: 'tinted',
    children: (
      <>
        <Icon name="star" size={12} /> featured
      </>
    ),
  },
};

/** Типовое применение: счётчик-остаток `+N`. */
export const AsCounter: Story = {
  name: 'Счётчик +N',
  args: { children: '+3', shape: 'pill', tone: 'tinted' },
};

/** В контексте: ряд тегов технологий на карточке проекта с остатком. */
export const InContext: Story = {
  name: 'В контексте: ряд тегов',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', maxWidth: 320 }}>
      {['React', 'TypeScript', 'Vite', 'Redux'].map((tech) => (
        <Tag key={tech}>{tech}</Tag>
      ))}
      <Tag shape="pill" tone="tinted">
        +2
      </Tag>
    </div>
  ),
};

/** Край: длинное название не ломает ряд — перенос на стороне контейнера. */
export const LongLabel: Story = {
  name: 'Край: длинное название',
  args: { children: 'react-server-components-experimental' },
  decorators: [(Story) => <div style={{ maxWidth: 220 }}>{Story()}</div>],
};

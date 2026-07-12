import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Avatar } from './avatar';

const meta = {
  title: 'Shared/primitives/Avatar',
  component: Avatar,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: { name: 'Bogdan Sutuzhko', size: 40 },

  argTypes: {
    name: {
      control: 'text',
      description: 'Имя — источник инициалов и доступной подписи.',
      table: { category: 'Контент' },
    },
    src: {
      control: 'text',
      description: 'URL фото. Без него рисуются инициалы.',
      table: { category: 'Контент' },
    },
    size: {
      control: { type: 'range', min: 24, max: 120, step: 2 },
      description: 'Размер квадрата в px.',
      table: { category: 'Оформление', defaultValue: { summary: '40' } },
    },
    color: {
      control: 'color',
      description: 'Сплошной фон (контрибьюторы). Без него — зелёный градиент.',
      table: { category: 'Оформление' },
    },
    shape: {
      control: 'inline-radio',
      options: ['circle', 'square'],
      description: 'Форма: круг (по умолчанию) или скруглённый квадрат.',
      table: { category: 'Оформление', defaultValue: { summary: 'circle' } },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница: имя даёт инициалы и подпись; src переключает на фото. */
export const Playground: Story = {};

/** Три режима сразу: градиент-инициалы, свой цвет, фото. */
export const Modes: Story = {
  name: 'Все режимы',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar name="Bogdan Sutuzhko" size={48} />
      <Avatar name="Anna Karenina" size={48} color="#4b6b8a" />
      <Avatar
        name="Bogdan Sutuzhko"
        size={48}
        src="https://avatars.githubusercontent.com/u/1?v=4"
      />
    </div>
  ),
};

/** Инициалы озвучиваются полным именем (`role="img"`). */
export const Initials: Story = {
  name: 'Инициалы (градиент)',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Bogdan Sutuzhko' })).toBeInTheDocument();
  },
};

/** Контрибьютор со своим сплошным цветом фона. */
export const Contributor: Story = {
  name: 'Контрибьютор (свой цвет)',
  args: { name: 'Anna Karenina', size: 34, color: '#4b6b8a' },
};

/** Квадратная форма: скруглённый квадрат (`--radius-button`) — заполняет квадратную кнопку. */
export const Square: Story = {
  name: 'Квадрат (заполняет кнопку)',
  args: { name: 'Bogdan Sutuzhko', size: 38, color: '#238636', shape: 'square' },
};

/** Фото: `<img alt={name}>` — доступная подпись сохраняется. */
export const Photo: Story = {
  name: 'Фото',
  args: { src: 'https://avatars.githubusercontent.com/u/1?v=4', size: 64 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Bogdan Sutuzhko' })).toBeInTheDocument();
  },
};

/** Размеры — от компактных меток до крупного профиля. */
export const Sizes: Story = {
  name: 'Размеры',
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {[28, 40, 64, 96].map((size) => (
        <Avatar key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

/** Край: инициалы корректно берутся из односоставного имени. */
export const SingleWord: Story = {
  name: 'Край: имя из одного слова',
  args: { name: 'Гость' },
};

/** Край: длинное имя — инициалы всё равно из двух букв, подпись полная. */
export const LongName: Story = {
  name: 'Край: длинное имя',
  args: { name: 'Александра-Виктория Мидлтон-Сазерленд', size: 56 },
};

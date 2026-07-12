import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Text } from './text';

const SIZES = ['body', 'small', 'caption', 'label'] as const;
const WEIGHTS = ['regular', 'medium', 'semibold', 'bold'] as const;

const meta = {
  title: 'Shared/primitives/Text',
  component: Text,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: {
    children: 'Инженерное качество важнее скорости реализации.',
    size: 'body',
    tone: 'default',
    weight: 'regular',
    family: 'sans',
  },

  argTypes: {
    as: {
      control: 'inline-radio',
      options: ['p', 'span', 'div', 'label', 'strong', 'em', 'small'],
      description: 'Семантический тег-обёртка. По умолчанию `p`.',
      table: { category: 'Семантика', defaultValue: { summary: 'p' } },
    },
    size: {
      control: 'inline-radio',
      options: SIZES,
      description: 'Размер из типографической шкалы токенов.',
      table: { category: 'Оформление', defaultValue: { summary: 'body' } },
    },
    tone: {
      control: 'inline-radio',
      options: ['default', 'muted', 'dim', 'primary', 'danger'],
      description: 'Смысловой цвет текста.',
      table: { category: 'Оформление', defaultValue: { summary: 'default' } },
    },
    weight: {
      control: 'inline-radio',
      options: WEIGHTS,
      description: 'Насыщенность начертания.',
      table: { category: 'Оформление', defaultValue: { summary: 'regular' } },
    },
    family: {
      control: 'inline-radio',
      options: ['sans', 'mono'],
      description: 'Семейство шрифта: интерфейсный или моноширинный.',
      table: { category: 'Оформление', defaultValue: { summary: 'sans' } },
    },
    truncate: {
      control: 'boolean',
      description: 'Обрезать одной строкой с многоточием.',
      table: { category: 'Поведение', defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. play проверяет тег по умолчанию — абзац `<p>`. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const node = canvas.getByText(/Инженерное качество/);
    await expect(node.tagName).toBe('P');
  },
};

/** Размер завязан на шкалу, а не на тег. */
export const Sizes: Story = {
  name: 'Размеры',
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Text size="body">body — основной текст интерфейса</Text>
      <Text size="small">small — вспомогательный текст</Text>
      <Text size="caption" family="mono">
        caption — моноширинная подпись
      </Text>
      <Text size="label" family="mono" tone="dim">
        label — техническая метка
      </Text>
    </div>
  ),
};

/** Смысловые тона вместо произвольных цветов. */
export const Tones: Story = {
  name: 'Тона',
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Text tone="default">default — основной цвет текста</Text>
      <Text tone="muted">muted — приглушённый вторичный текст</Text>
      <Text tone="dim">dim — третичный / подсказки</Text>
      <Text tone="primary">primary — акцентный текст</Text>
      <Text tone="danger">danger — ошибка / удаление</Text>
    </div>
  ),
};

/** Насыщенность начертания. */
export const Weights: Story = {
  name: 'Насыщенность',
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {WEIGHTS.map((weight) => (
        <Text key={weight} weight={weight}>
          {weight}
        </Text>
      ))}
    </div>
  ),
};

/** Исчерпывающая матрица размер × насыщенность. */
export const Matrix: Story = {
  name: 'Матрица: размер × насыщенность',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {SIZES.map((size) => (
        <div
          key={size}
          style={{ display: 'flex', gap: 20, alignItems: 'baseline', flexWrap: 'wrap' }}
        >
          <Text size="label" tone="dim" family="mono" as="span">
            {size}
          </Text>
          {WEIGHTS.map((weight) => (
            <Text key={weight} size={size} weight={weight} as="span">
              {weight}
            </Text>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Sans против mono. */
export const Families: Story = {
  name: 'Семейства',
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Text family="sans">sans — интерфейсный текст</Text>
      <Text family="mono" tone="muted">
        mono — const answer = 42;
      </Text>
    </div>
  ),
};

/** Полиморфизм: один визуал на разных семантических тегах. */
export const Polymorphic: Story = {
  name: 'Полиморфный as',
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <Text as="p">as=&quot;p&quot; — абзац</Text>
      <Text as="span">as=&quot;span&quot; — инлайн</Text>
      <Text as="label">as=&quot;label&quot; — подпись поля</Text>
      <Text as="strong" weight="semibold">
        as=&quot;strong&quot; — смысловой акцент
      </Text>
      <Text as="small" size="small" tone="dim">
        as=&quot;small&quot; — мелкая приписка
      </Text>
    </div>
  ),
};

/** Инлайн-акценты: Text вкладывается в Text. */
export const InlineAccents: Story = {
  name: 'Инлайн-акценты',
  render: () => (
    <Text>
      Проект собран на{' '}
      <Text as="strong" weight="semibold" tone="primary">
        React
      </Text>{' '}
      и{' '}
      <Text as="strong" weight="semibold" tone="primary">
        TypeScript
      </Text>
      .
    </Text>
  ),
};

/** Край: обрезка длинной строки одной линией с многоточием. */
export const Truncate: Story = {
  name: 'Край: обрезка строки',
  decorators: [(Story) => <div style={{ maxWidth: 240 }}>{Story()}</div>],
  args: {
    truncate: true,
    children: 'Очень длинный неразрывный текст, который не помещается в контейнер и обрезается',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Очень длинный неразрывный текст/)).toBeInTheDocument();
  },
};

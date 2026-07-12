import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Textarea } from './textarea';

const meta = {
  title: 'Shared/primitives/Textarea',
  component: Textarea,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: { label: 'Био', placeholder: 'Расскажите о себе…', rows: 4 },

  argTypes: {
    label: { control: 'text', table: { category: 'Контент' } },
    hint: { control: 'text', table: { category: 'Контент' } },
    error: {
      control: 'text',
      description: 'Текст ошибки. Если задан — поле помечается невалидным.',
      table: { category: 'Состояние' },
    },
    invalid: { control: 'boolean', table: { category: 'Состояние' } },
    disabled: { control: 'boolean', table: { category: 'Состояние' } },
    rows: { control: 'number', table: { category: 'Оформление' } },
  },

  decorators: [(Story) => <div style={{ width: 360 }}>{Story()}</div>],
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. play: многострочный ввод сохраняется. */
export const Playground: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText('Био');
    await userEvent.type(field, 'Строка 1{enter}Строка 2');
    await expect(field).toHaveValue('Строка 1\nСтрока 2');
  },
};

/** Все состояния сразу. */
export const States: Story = {
  name: 'Все состояния',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Textarea label="По умолчанию" rows={3} placeholder="…" />
      <Textarea label="С подсказкой" rows={3} hint="Поддерживается Markdown" />
      <Textarea label="С ошибкой" rows={3} error="Поле обязательно" />
      <Textarea label="Недоступно" rows={3} disabled defaultValue="Только чтение" />
    </div>
  ),
};

/** С подсказкой. */
export const WithHint: Story = {
  name: 'С подсказкой',
  args: { hint: 'Поддерживается Markdown' },
};

/** С ошибкой. */
export const WithError: Story = {
  name: 'С ошибкой',
  args: { error: 'Поле обязательно' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Био')).toHaveAttribute('aria-invalid', 'true');
  },
};

/** Недоступно. */
export const Disabled: Story = {
  name: 'Недоступно',
  args: { disabled: true, defaultValue: 'Только чтение' },
};

/** Край: длинное содержимое прокручивается внутри поля заданной высоты. */
export const LongContent: Story = {
  name: 'Край: длинный текст',
  args: {
    rows: 4,
    defaultValue: Array.from(
      { length: 12 },
      (_, i) => `Строка ${i + 1} многострочного описания.`,
    ).join('\n'),
  },
};

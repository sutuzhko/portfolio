import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Input } from './input';

const meta = {
  title: 'Shared/primitives/Input',
  component: Input,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: { label: 'Логин', placeholder: 'логин' },

  argTypes: {
    label: { control: 'text', description: 'Подпись поля.', table: { category: 'Контент' } },
    hint: { control: 'text', description: 'Подсказка под полем.', table: { category: 'Контент' } },
    error: {
      control: 'text',
      description: 'Текст ошибки. Если задан — поле помечается невалидным.',
      table: { category: 'Состояние' },
    },
    invalid: {
      control: 'boolean',
      description: 'Пометить невалидным без текста ошибки.',
      table: { category: 'Состояние' },
    },
    disabled: { control: 'boolean', table: { category: 'Состояние' } },
  },

  decorators: [(Story) => <div style={{ width: 320 }}>{Story()}</div>],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. play: ввод текста доходит до значения поля. */
export const Playground: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText('Логин');
    await userEvent.type(field, 'bogdan');
    await expect(field).toHaveValue('bogdan');
  },
};

/** Все состояния поля сразу. */
export const States: Story = {
  name: 'Все состояния',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Input label="По умолчанию" placeholder="логин" />
      <Input label="С подсказкой" hint="Используйте латиницу" placeholder="логин" />
      <Input label="С ошибкой" defaultValue="bad" error="✗ неверный логин" />
      <Input label="Недоступно" disabled defaultValue="bogdan" />
    </div>
  ),
};

/** С подсказкой под полем. */
export const WithHint: Story = {
  name: 'С подсказкой',
  args: { hint: 'Используйте латиницу' },
};

/** Ошибка заменяет подсказку и озвучивается как описание поля (`aria-describedby`). */
export const WithError: Story = {
  name: 'С ошибкой',
  args: { defaultValue: 'bad', error: '✗ неверный логин или пароль' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText('Логин');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAccessibleDescription('✗ неверный логин или пароль');
  },
};

/** Недоступное поле. */
export const Disabled: Story = {
  name: 'Недоступно',
  args: { disabled: true, defaultValue: 'bogdan' },
};

/** Тип пароля. */
export const Password: Story = {
  name: 'Пароль',
  args: { label: 'Пароль', type: 'password', placeholder: '••••••••' },
};

/** Без видимой подписи — обязателен `aria-label`, иначе поле без доступного имени. */
export const WithoutLabel: Story = {
  name: 'Без подписи',
  args: { label: undefined, 'aria-label': 'Поиск', placeholder: 'Поиск…' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Поиск' })).toBeInTheDocument();
  },
};

/** Край: длинный текст ошибки переносится под полем. */
export const LongError: Story = {
  name: 'Край: длинная ошибка',
  args: {
    defaultValue: 'x',
    error: 'Логин должен содержать от 3 до 32 символов латиницы, цифр и дефиса, без пробелов',
  },
};

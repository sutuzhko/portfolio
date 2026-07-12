import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { FieldFrame } from './field-frame';
import control from './control.module.css';

const meta = {
  title: 'Shared/primitives/FieldFrame',
  component: FieldFrame,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: {
    id: 'demo-field',
    label: 'Подпись',
    messageId: 'demo-field-msg',
    children: <input id="demo-field" className={control.control} placeholder="контрол внутри" />,
  },

  argTypes: {
    id: {
      control: 'text',
      description: 'id связанного контрола (для label[for]).',
      table: { category: 'Связывание' },
    },
    label: { control: 'text', table: { category: 'Контент' } },
    hint: { control: 'text', table: { category: 'Контент' } },
    error: {
      control: 'text',
      description: 'Сообщение об ошибке. Приоритетнее подсказки.',
      table: { category: 'Состояние' },
    },
    messageId: {
      control: 'text',
      description: 'id сообщения (для aria-describedby контрола).',
      table: { category: 'Связывание' },
    },
    children: { control: false, table: { category: 'Контент' } },
  },

  decorators: [(Story) => <div style={{ width: 320 }}>{Story()}</div>],
} satisfies Meta<typeof FieldFrame>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. play: подпись связана с контролом через label[for]. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Подпись')).toBeInTheDocument();
  },
};

/** Все варианты обвязки сразу. */
export const States: Story = {
  name: 'Все варианты',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <FieldFrame id="f1" label="Только подпись" messageId="f1-msg">
        <input id="f1" className={control.control} placeholder="…" />
      </FieldFrame>
      <FieldFrame id="f2" label="С подсказкой" hint="Вспомогательный текст" messageId="f2-msg">
        <input id="f2" className={control.control} placeholder="…" />
      </FieldFrame>
      <FieldFrame
        id="f3"
        label="С ошибкой"
        hint="скрыта ошибкой"
        error="Обязательное поле"
        messageId="f3-msg"
      >
        <input id="f3" className={control.control} aria-invalid placeholder="…" />
      </FieldFrame>
      <FieldFrame id="f4" messageId="f4-msg">
        <input
          id="f4"
          className={control.control}
          aria-label="Без подписи"
          placeholder="без подписи"
        />
      </FieldFrame>
    </div>
  ),
};

/** Только подпись. */
export const OnlyLabel: Story = {
  name: 'Только подпись',
};

/** С подсказкой. */
export const WithHint: Story = {
  name: 'С подсказкой',
  args: { hint: 'Вспомогательный текст под полем' },
};

/** Ошибка приоритетнее — подсказка не показывается. */
export const WithError: Story = {
  name: 'С ошибкой',
  args: { hint: 'Эта подсказка скрыта ошибкой', error: 'Обязательное поле' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Обязательное поле')).toBeInTheDocument();
    await expect(canvas.queryByText('Эта подсказка скрыта ошибкой')).not.toBeInTheDocument();
  },
};

/** Без подписи (только контрол). */
export const WithoutLabel: Story = {
  name: 'Без подписи',
  args: { label: undefined },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Select } from './select';

const meta = {
  title: 'Shared/primitives/Select',
  component: Select,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: { label: 'Папка' },

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
  },

  decorators: [(Story) => <div style={{ width: 320 }}>{Story()}</div>],

  render: (args) => (
    <Select {...args}>
      <option value="root">Корень</option>
      <option value="js">JavaScript</option>
      <option value="ts">TypeScript</option>
    </Select>
  ),
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница (нативный select). play: выбор опции меняет значение. */
export const Playground: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByLabelText('Папка');
    await userEvent.selectOptions(select, 'ts');
    await expect(select).toHaveValue('ts');
  },
};

/** Все состояния сразу. */
export const States: Story = {
  name: 'Все состояния',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(
        [
          { label: 'По умолчанию' },
          { label: 'С подсказкой', hint: 'Куда поместить статью' },
          { label: 'С ошибкой', error: 'Выберите папку' },
          { label: 'Недоступно', disabled: true },
        ] as const
      ).map((props) => (
        <Select key={props.label} {...props}>
          <option value="root">Корень</option>
          <option value="js">JavaScript</option>
        </Select>
      ))}
    </div>
  ),
};

/** С подсказкой. */
export const WithHint: Story = {
  name: 'С подсказкой',
  args: { hint: 'Куда поместить статью' },
};

/** С ошибкой. */
export const WithError: Story = {
  name: 'С ошибкой',
  args: { error: 'Выберите папку' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Папка')).toHaveAttribute('aria-invalid', 'true');
  },
};

/** Недоступно. */
export const Disabled: Story = {
  name: 'Недоступно',
  args: { disabled: true },
};

/** Край: длинный список опций — прокрутка нативного пикера. */
export const ManyOptions: Story = {
  name: 'Край: много опций',
  render: (args) => (
    <Select {...args} label="Технология">
      {['React', 'Vue', 'Svelte', 'Angular', 'Solid', 'Qwik', 'Preact', 'Lit', 'Alpine'].map(
        (tech) => (
          <option key={tech} value={tech.toLowerCase()}>
            {tech}
          </option>
        ),
      )}
    </Select>
  ),
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { Toast } from './toast';

const meta = {
  title: 'Shared/components/Toast',
  component: Toast,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: {
    type: 'info',
    title: 'Заголовок',
    description: 'Поясняющий текст уведомления.',
    closeLabel: 'Закрыть',
    onClose: fn(),
    progress: 58,
  },

  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['info', 'success', 'warning', 'error'],
      description: 'Уровень: info/success — polite, warning/error — assertive (alert).',
      table: { category: 'Оформление', defaultValue: { summary: 'info' } },
    },
    title: { control: 'text', table: { category: 'Контент' } },
    description: { control: 'text', table: { category: 'Контент' } },
    progress: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'Статичная полоса остатка 0–100 (напр. прогресс загрузки).',
      table: { category: 'Оформление' },
    },
    duration: {
      control: { type: 'number' },
      description:
        'Длительность автозакрытия, мс — анимированная полоса отсчёта (приоритетнее progress).',
      table: { category: 'Оформление' },
    },
    paused: {
      control: 'boolean',
      description: 'Пауза анимации полосы отсчёта (наведение на стек).',
      table: { category: 'Оформление' },
    },
    closeLabel: { control: 'text', table: { category: 'Доступность' } },
    onClose: { control: false, table: { category: 'События' } },
  },

  decorators: [(Story) => <div style={{ width: 360 }}>{Story()}</div>],
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: 'Интерактивный пример',
};

export const Info: Story = {
  args: { type: 'info', title: 'Сохранено', description: 'Черновик сохранён локально.' },
};

export const Success: Story = {
  args: { type: 'success', title: 'Готово', description: 'Действие выполнено.' },
};

export const Warning: Story = {
  args: { type: 'warning', title: 'Внимание', description: 'Проверьте данные.' },
  play: async ({ canvas }) => {
    // Предупреждения объявляются немедленно (assertive)
    await expect(canvas.getByRole('alert')).toBeInTheDocument();
  },
};

export const Error: Story = {
  args: { type: 'error', title: 'Ошибка', description: 'Не удалось выполнить.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toBeInTheDocument();
  },
};

export const WithoutDescription: Story = {
  name: 'Без описания',
  args: { type: 'success', title: 'Скопировано', description: undefined },
};

export const WithoutClose: Story = {
  name: 'Без кнопки закрытия',
  args: { onClose: undefined, progress: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const WithProgress: Story = {
  name: 'Со статичной полосой',
  args: {
    type: 'info',
    title: 'Осталось 40%',
    description: 'Статичная полоса — например, прогресс загрузки.',
    progress: 40,
  },
};

export const Countdown: Story = {
  name: 'Полоса автозакрытия (отсчёт)',
  args: {
    type: 'success',
    title: 'Автозакрытие',
    description: 'Полоса сжимается за отведённое время; пауза замирает её.',
    progress: undefined,
    duration: 6000,
    paused: false,
  },
};

export const CountdownPaused: Story = {
  name: 'Полоса на паузе',
  args: {
    type: 'warning',
    title: 'Наведение — пауза',
    description: 'Пока курсор над стеком, отсчёт остановлен.',
    progress: undefined,
    duration: 6000,
    paused: true,
  },
};

export const AllTypes: Story = {
  name: 'Все типы',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Toast {...args} type="info" title="INFO" description="Информационное сообщение." />
      <Toast {...args} type="success" title="OK" description="Успех." />
      <Toast {...args} type="warning" title="WARN" description="Предупреждение." />
      <Toast {...args} type="error" title="ERROR" description="Ошибка." />
    </div>
  ),
};

/** Закрытие вызывает onClose (клик по крестику). */
export const Closing: Story = {
  name: 'Закрытие',
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Закрыть' }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

/** Край: длинные заголовок и описание переносятся, не ломая карточку. */
export const LongContent: Story = {
  name: 'Край: длинный текст',
  args: {
    type: 'error',
    title: 'Не удалось сохранить изменения профиля',
    description:
      'Сервер вернул ошибку 500 при обращении к PATCH /api/profile. Изменения не применены — попробуйте ещё раз через минуту или проверьте соединение.',
  },
};

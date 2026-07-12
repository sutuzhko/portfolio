import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from '@sutuzhko/ui-kit';

import { ToasterProvider } from './model/toaster-provider';
import { useToaster } from './model/toaster-context';
import type { ToastItem } from './model/use-toaster-queue';
import { ToasterView } from './ui/toaster-view';

const sample: readonly ToastItem[] = [
  {
    id: 1,
    type: 'success',
    title: 'Профиль сохранён',
    description: 'Изменения применены на сервере.',
    duration: 5000,
    leaving: false,
  },
  {
    id: 2,
    type: 'info',
    title: 'Черновик сохранён',
    description: 'Автосохранение каждые 30 секунд.',
    duration: 5000,
    leaving: false,
  },
];

const meta = {
  title: 'Features/Toaster',
  component: ToasterView,
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
  },
  args: {
    toasts: sample,
    // Полосы отсчёта заморожены, чтобы снимок был стабильным.
    paused: true,
    onDismiss: fn(),
    onPause: fn(),
    onResume: fn(),
    regionLabel: 'Уведомления',
    closeLabel: 'Закрыть',
  },
  argTypes: {
    toasts: { control: false, table: { category: 'Данные' } },
    paused: { control: 'boolean', table: { category: 'Состояние' } },
    regionLabel: { control: 'text', table: { category: 'Доступность' } },
    closeLabel: { control: 'text', table: { category: 'Доступность' } },
    onDismiss: { control: false, table: { category: 'События' } },
    onPause: { control: false, table: { category: 'События' } },
    onResume: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof ToasterView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: 'Интерактивный пример',
};

/** Все четыре уровня в одном стеке. */
export const AllTypes: Story = {
  name: 'Все уровни',
  args: {
    toasts: [
      {
        id: 1,
        type: 'info',
        title: 'INFO',
        description: 'Информационное сообщение.',
        duration: 5000,
        leaving: false,
      },
      {
        id: 2,
        type: 'success',
        title: 'OK',
        description: 'Действие выполнено.',
        duration: 5000,
        leaving: false,
      },
      {
        id: 3,
        type: 'warning',
        title: 'WARN',
        description: 'Проверьте данные.',
        duration: 6500,
        leaving: false,
      },
      {
        id: 4,
        type: 'error',
        title: 'ERROR',
        description: 'Не удалось выполнить.',
        duration: 7000,
        leaving: false,
      },
    ],
  },
};

/** Уходящий тост (фаза `leaving`) — играет анимация исчезновения. */
export const Leaving: Story = {
  name: 'Уход тоста',
  args: {
    paused: false,
    toasts: [{ ...sample[0], leaving: true }, sample[1]],
  },
};

/** Край: длинные заголовок и описание переносятся, не ломая карточку. */
export const LongContent: Story = {
  name: 'Край: длинный текст',
  args: {
    toasts: [
      {
        id: 1,
        type: 'error',
        title: 'Не удалось сохранить изменения профиля',
        description:
          'Сервер вернул ошибку 500 при обращении к PATCH /api/profile. Изменения не применены — попробуйте ещё раз через минуту.',
        duration: 7000,
        leaving: false,
      },
    ],
  },
};

/** Мобильная раскладка: стек снизу во всю ширину. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

/**
 * Живой поток: кнопки вызывают `notify` через `useToaster`. Тосты сами
 * встают в стек, отсчитывают время и закрываются.
 */
export const Interactive: Story = {
  name: 'Живой поток (notify)',
  render: () => (
    <ToasterProvider>
      <NotifyButtons />
    </ToasterProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'success' }));
    // Тост порталится в document.body — ищем там.
    await expect(within(document.body).getByText('Готово')).toBeInTheDocument();
  },
};

function NotifyButtons() {
  const { notify } = useToaster();
  return (
    <div style={{ display: 'flex', gap: 8, padding: 24, flexWrap: 'wrap' }}>
      <Button
        variant="mono"
        onClick={() =>
          notify({ type: 'info', title: 'Сохранено', description: 'Черновик сохранён.' })
        }
      >
        info
      </Button>
      <Button
        variant="mono"
        onClick={() =>
          notify({ type: 'success', title: 'Готово', description: 'Действие выполнено.' })
        }
      >
        success
      </Button>
      <Button
        variant="mono"
        onClick={() =>
          notify({ type: 'warning', title: 'Внимание', description: 'Проверьте данные.' })
        }
      >
        warning
      </Button>
      <Button
        variant="mono"
        onClick={() =>
          notify({ type: 'error', title: 'Ошибка', description: 'Что-то пошло не так.' })
        }
      >
        error
      </Button>
    </div>
  );
}

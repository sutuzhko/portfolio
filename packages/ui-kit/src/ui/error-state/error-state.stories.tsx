import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { ErrorState } from './error-state';

const meta = {
  title: 'Shared/components/ErrorState',
  component: ErrorState,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: {
    message: 'Не удалось загрузить данные',
    retryLabel: 'Повторить',
    onRetry: fn(),
  },
  argTypes: {
    message: { control: 'text', table: { category: 'Контент' } },
    retryLabel: { control: 'text', table: { category: 'Контент' } },
    onRetry: { control: false, table: { disable: true } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}>{Story()}</div>],
} satisfies Meta<typeof ErrorState>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. play: клик по «Повторить» вызывает onRetry. */
export const Playground: Story = {
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }));
    await expect(args.onRetry).toHaveBeenCalled();
  },
};

/** Без `onRetry` — только сообщение (например, ошибка невосстановима). */
export const WithoutRetry: Story = {
  name: 'Без повтора',
  args: { onRetry: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

/** Повтор доступен с клавиатуры: Tab → фокус, Enter вызывает onRetry. */
export const KeyboardRetry: Story = {
  name: 'Повтор с клавиатуры',
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const retry = canvas.getByRole('button', { name: 'Повторить' });
    await userEvent.tab();
    await expect(retry).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRetry).toHaveBeenCalled();
  },
};

/** Край: длинное сообщение об ошибке переносится в пределах карточки. */
export const LongMessage: Story = {
  name: 'Край: длинное сообщение',
  args: {
    message:
      'Сервис статистики временно недоступен (503). Данные подтянутся автоматически, как только источник восстановится, либо повторите запрос вручную.',
  },
};

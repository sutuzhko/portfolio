import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import type { ToastItem } from '../model/use-toaster-queue';

import { ToasterView } from './toaster-view';

const toasts: readonly ToastItem[] = [
  {
    id: 1,
    type: 'success',
    title: 'Готово',
    description: 'Действие выполнено',
    duration: 5000,
    leaving: false,
  },
  { id: 2, type: 'error', title: 'Ошибка', duration: 7000, leaving: false },
];

function renderView(props: Partial<ComponentProps<typeof ToasterView>> = {}) {
  return render(
    <ToasterView
      toasts={toasts}
      paused={false}
      onDismiss={vi.fn()}
      onPause={vi.fn()}
      onResume={vi.fn()}
      regionLabel="Уведомления"
      closeLabel="Закрыть"
      {...props}
    />,
  );
}

describe('ToasterView', () => {
  it('пустой стек ничего не рендерит', () => {
    const { container } = renderView({ toasts: [] });
    expect(container).toBeEmptyDOMElement();
  });

  it('рендерит все тосты в именованной области', () => {
    renderView();
    expect(screen.getByRole('region', { name: 'Уведомления' })).toBeInTheDocument();
    expect(screen.getByText('Готово')).toBeInTheDocument();
    expect(screen.getByText('Ошибка')).toBeInTheDocument();
  });

  it('крестик вызывает onDismiss с id тоста', async () => {
    const onDismiss = vi.fn();
    renderView({ onDismiss });

    const [first] = screen.getAllByRole('button', { name: 'Закрыть' });
    await userEvent.click(first);

    expect(onDismiss).toHaveBeenCalledWith(1);
  });

  it('наведение ставит на паузу, уход — возобновляет', async () => {
    const onPause = vi.fn();
    const onResume = vi.fn();
    renderView({ onPause, onResume });

    await userEvent.hover(screen.getByText('Готово'));
    expect(onPause).toHaveBeenCalled();

    await userEvent.unhover(screen.getByText('Готово'));
    expect(onResume).toHaveBeenCalled();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderView();
    expect(await axe(container)).toHaveNoViolations();
  });
});

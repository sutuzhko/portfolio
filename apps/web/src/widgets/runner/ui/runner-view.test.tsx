import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';

import { RunnerView, type RunnerViewProps, type RunnerWindowState } from './runner-view';

function renderView(overrides: Partial<RunnerViewProps> = {}) {
  const props: RunnerViewProps = {
    project: { title: 'Игра: 2048', embedUrl: 'https://example.com/2048/' },
    windowState: 'normal' satisfies RunnerWindowState,
    onClose: vi.fn(),
    onMinimize: vi.fn(),
    onToggleMaximize: vi.fn(),
    onRestore: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  };
  return { props, ...renderWithProviders(<RunnerView {...props} />) };
}

describe('RunnerView', () => {
  it('показывает окно с заголовком проекта и встроенным iframe', () => {
    renderView();
    expect(screen.getByRole('dialog', { name: /Игра: 2048/ })).toBeInTheDocument();
    const frame = screen.getByTitle('Игра: 2048');
    expect(frame).toHaveAttribute('src', 'https://example.com/2048/');
    expect(frame).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin');
  });

  it('кнопки хрома вызывают свои колбэки', async () => {
    const { props } = renderView();
    await userEvent.click(screen.getByRole('button', { name: 'Свернуть проект' }));
    expect(props.onMinimize).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Развернуть на всю ширину' }));
    expect(props.onToggleMaximize).toHaveBeenCalled();
  });

  it('закрытие доступно и по фону, и по красному свету', async () => {
    const { props } = renderView();
    const closers = screen.getAllByRole('button', { name: 'Закрыть проект' });
    expect(closers.length).toBeGreaterThanOrEqual(2);
    await userEvent.click(closers[0]);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('по таймауту загрузки показывает bash-ошибку и уведомляет один раз', () => {
    vi.useFakeTimers();
    try {
      const { props } = renderView({ loadTimeoutMs: 1000 });
      // До таймаута — обычный iframe, без ошибки.
      expect(screen.getByTitle('Игра: 2048')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/не удалось запустить «Игра: 2048»/i);
      // iframe убран — вместо вечного спиннера показана заглушка.
      expect(screen.queryByTitle('Игра: 2048')).not.toBeInTheDocument();
      expect(props.onError).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('загрузка iframe до таймаута отменяет ошибку', () => {
    vi.useFakeTimers();
    try {
      const { props } = renderView({ loadTimeoutMs: 1000 });
      act(() => {
        fireEvent.load(screen.getByTitle('Игра: 2048'));
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(props.onError).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('свёрнутый раннер показывает пилюлю трея без окна', () => {
    renderView({ windowState: 'minimized' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Игра: 2048' })).toBeInTheDocument();
  });

  it('нет нарушений доступности', async () => {
    const { container } = renderView();
    // iframes:false — axe не заходит внутрь встроенного проекта (чужой origin).
    expect(await axe(container, { iframes: false })).toHaveNoViolations();
  });
});

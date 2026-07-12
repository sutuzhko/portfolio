import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MAX_TOASTS, TOAST_EXIT_MS } from './config';
import { useToasterQueue } from './use-toaster-queue';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useToasterQueue', () => {
  it('добавляет тост, применяет дефолт типа и возвращает id', () => {
    const { result } = renderHook(() => useToasterQueue());

    let id = 0;
    act(() => {
      id = result.current.notify({ title: 'Привет' });
    });

    expect(id).toBe(1);
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type: 'info',
      title: 'Привет',
      leaving: false,
    });
  });

  it('автозакрывает: сначала фаза ухода, затем удаление из DOM', () => {
    const { result } = renderHook(() => useToasterQueue());

    act(() => {
      result.current.notify({ title: 'X', duration: 1000 });
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.toasts[0].leaving).toBe(true);

    act(() => {
      vi.advanceTimersByTime(TOAST_EXIT_MS);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('duration: 0 не закрывается автоматически', () => {
    const { result } = renderHook(() => useToasterQueue());

    act(() => {
      result.current.notify({ title: 'sticky', duration: 0 });
    });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(result.current.toasts).toHaveLength(1);
  });

  it('пауза откладывает автозакрытие, resume — возобновляет', () => {
    const { result } = renderHook(() => useToasterQueue());

    act(() => {
      result.current.notify({ title: 'X', duration: 1000 });
    });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    act(() => {
      result.current.pause();
    });
    // На паузе таймер не идёт — даже спустя много времени тост на месте.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.paused).toBe(true);
    expect(result.current.toasts[0].leaving).toBe(false);

    act(() => {
      result.current.resume();
    });
    // Осталось 400 мс (1000 − 600 до паузы) — их и ждём до фазы ухода.
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.toasts[0].leaving).toBe(true);
  });

  it('ручное закрытие уводит и удаляет тост', () => {
    const { result } = renderHook(() => useToasterQueue());

    let id = 0;
    act(() => {
      id = result.current.notify({ title: 'X', duration: 0 });
    });
    act(() => {
      result.current.dismiss(id);
    });
    expect(result.current.toasts[0].leaving).toBe(true);

    act(() => {
      vi.advanceTimersByTime(TOAST_EXIT_MS);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('хранит не больше MAX_TOASTS — вытесняет старейшие', () => {
    const { result } = renderHook(() => useToasterQueue());

    act(() => {
      for (let i = 1; i <= MAX_TOASTS + 2; i += 1) {
        result.current.notify({ title: `T${String(i)}`, duration: 0 });
      }
    });

    expect(result.current.toasts).toHaveLength(MAX_TOASTS);
    expect(result.current.toasts[0].title).toBe('T3');
  });
});

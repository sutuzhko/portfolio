import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ToastType } from '@sutuzhko/ui-kit';

import { DEFAULT_DURATION, MAX_TOASTS, TOAST_EXIT_MS } from './config';
import type { ToastOptions } from './toaster-context';

/** Тост в очереди: разобранные опции + id + фаза ухода. */
export interface ToastItem {
  readonly id: number;
  readonly type: ToastType;
  readonly title: string;
  readonly description?: string;
  /** Полное время автозакрытия, мс (`0` — не закрывать). */
  readonly duration: number;
  /** `true`, пока играет анимация ухода перед удалением из DOM. */
  readonly leaving: boolean;
}

/** Состояние таймера автозакрытия одного тоста (живёт вне рендера). */
interface DismissTimer {
  /** Остаток до автозакрытия, мс — уменьшается при паузе. */
  remaining: number;
  /** Момент запуска текущего таймера, мс — для вычисления остатка при паузе. */
  startedAt: number;
  /** Активный таймер или `undefined`, если он на паузе. */
  handle: ReturnType<typeof setTimeout> | undefined;
}

export interface ToasterQueue {
  readonly toasts: readonly ToastItem[];
  /** Стек на паузе (курсор над ним) — полосы отсчёта замирают. */
  readonly paused: boolean;
  readonly notify: (options: ToastOptions) => number;
  readonly dismiss: (id: number) => void;
  readonly pause: () => void;
  readonly resume: () => void;
}

/**
 * Очередь тостов: хранит список, сам заводит таймеры автозакрытия и умеет их
 * приостанавливать (наведение мышью), чтобы читатель успел прочитать сообщение.
 *
 * Таймеры живут в ref, а не в state: они не влияют на разметку, и их изменение не
 * должно провоцировать рендер. Автозакрытие ведём на JS-таймерах, а не на
 * CSS-анимации полосы, — чтобы оно работало и при `prefers-reduced-motion`, и
 * было детерминированно тестируемым.
 */
export function useToasterQueue(): ToasterQueue {
  const [toasts, setToasts] = useState<readonly ToastItem[]>([]);
  const [paused, setPaused] = useState(false);

  const idRef = useRef(0);
  const dismissTimers = useRef(new Map<number, DismissTimer>());
  const removalTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const pausedRef = useRef(false);

  const clearDismissTimer = useCallback((id: number) => {
    const timer = dismissTimers.current.get(id);
    if (timer?.handle !== undefined) clearTimeout(timer.handle);
    dismissTimers.current.delete(id);
  }, []);

  // Убирает тост из DOM после анимации ухода.
  const remove = useCallback((id: number) => {
    const removal = removalTimers.current.get(id);
    if (removal !== undefined) clearTimeout(removal);
    removalTimers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  // Гасит автозакрытие, помечает уход и планирует удаление из DOM.
  const dismiss = useCallback(
    (id: number) => {
      clearDismissTimer(id);
      if (removalTimers.current.has(id)) return; // уже уходит
      setToasts((current) =>
        current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
      );
      removalTimers.current.set(
        id,
        setTimeout(() => remove(id), TOAST_EXIT_MS),
      );
    },
    [clearDismissTimer, remove],
  );

  // Заводит (или перезаводит) таймер автозакрытия на `remaining` мс.
  const schedule = useCallback(
    (id: number, remaining: number) => {
      dismissTimers.current.set(id, {
        remaining,
        startedAt: Date.now(),
        handle: setTimeout(() => dismiss(id), remaining),
      });
    },
    [dismiss],
  );

  const notify = useCallback(
    (options: ToastOptions): number => {
      idRef.current += 1;
      const id = idRef.current;
      const type = options.type ?? 'info';
      const duration = options.duration ?? DEFAULT_DURATION[type];

      setToasts((current) => {
        const next = [
          ...current,
          {
            id,
            type,
            title: options.title,
            description: options.description,
            duration,
            leaving: false,
          },
        ];
        // Вытесняем старейшие вместе с их таймерами, чтобы те не текли.
        for (const dropped of next.slice(0, Math.max(0, next.length - MAX_TOASTS))) {
          clearDismissTimer(dropped.id);
        }
        return next.slice(-MAX_TOASTS);
      });

      if (duration > 0) {
        if (pausedRef.current) {
          // Курсор над стеком — заводим «на паузе», запустит `resume`.
          dismissTimers.current.set(id, {
            remaining: duration,
            startedAt: Date.now(),
            handle: undefined,
          });
        } else {
          schedule(id, duration);
        }
      }
      return id;
    },
    [clearDismissTimer, schedule],
  );

  const pause = useCallback(() => {
    if (pausedRef.current) return;
    pausedRef.current = true;
    setPaused(true);
    const now = Date.now();
    for (const timer of dismissTimers.current.values()) {
      if (timer.handle === undefined) continue;
      clearTimeout(timer.handle);
      timer.remaining = Math.max(0, timer.remaining - (now - timer.startedAt));
      timer.handle = undefined;
    }
  }, []);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    setPaused(false);
    for (const [id, timer] of [...dismissTimers.current.entries()]) {
      if (timer.handle !== undefined) continue;
      if (timer.remaining <= 0) dismiss(id);
      else schedule(id, timer.remaining);
    }
  }, [dismiss, schedule]);

  // Гасим все таймеры при размонтировании — без утечек.
  useEffect(() => {
    const dismissMap = dismissTimers.current;
    const removalMap = removalTimers.current;
    return () => {
      for (const timer of dismissMap.values()) {
        if (timer.handle !== undefined) clearTimeout(timer.handle);
      }
      for (const handle of removalMap.values()) clearTimeout(handle);
      dismissMap.clear();
      removalMap.clear();
    };
  }, []);

  return useMemo(
    () => ({ toasts, paused, notify, dismiss, pause, resume }),
    [toasts, paused, notify, dismiss, pause, resume],
  );
}

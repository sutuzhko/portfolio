import { createContext, useContext } from 'react';

import type { ToastType } from '@sutuzhko/ui-kit';

/** Параметры одного уведомления. Заголовок обязателен, остальное — по умолчанию. */
export interface ToastOptions {
  readonly type?: ToastType;
  readonly title: string;
  readonly description?: string;
  /** Время до автозакрытия, мс. `0` — не закрывать. По умолчанию — по типу. */
  readonly duration?: number;
}

export interface ToasterContextValue {
  /** Показать тост. Возвращает его id (для ручного `dismiss`). */
  readonly notify: (options: ToastOptions) => number;
  /** Закрыть тост по id (обычно достаточно автозакрытия и крестика). */
  readonly dismiss: (id: number) => void;
}

export const ToasterContext = createContext<ToasterContextValue | null>(null);

/**
 * Доступ к тостам из любого места приложения. Бросает вне ToasterProvider —
 * это ошибка композиции.
 */
export function useToaster(): ToasterContextValue {
  const value = useContext(ToasterContext);
  if (value === null) {
    throw new Error('useToaster должен использоваться внутри ToasterProvider');
  }
  return value;
}

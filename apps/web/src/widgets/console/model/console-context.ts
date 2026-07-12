import { createContext, useContext } from 'react';

export interface ConsoleContextValue {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
  readonly toggle: () => void;
}

export const ConsoleContext = createContext<ConsoleContextValue | null>(null);

/**
 * Доступ к состоянию консоли (открыть/закрыть). Бросает вне ConsoleProvider —
 * это ошибка композиции.
 */
export function useConsole(): ConsoleContextValue {
  const value = useContext(ConsoleContext);
  if (value === null) {
    throw new Error('useConsole должен использоваться внутри ConsoleProvider');
  }
  return value;
}

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ConsoleContext, type ConsoleContextValue } from './console-context';

interface ConsoleProviderProps {
  readonly children: ReactNode;
}

/** Совпадает с ⌘K на macOS и Ctrl+K на остальных платформах. */
function isToggleShortcut(event: KeyboardEvent): boolean {
  return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
}

/**
 * Владеет глобальным состоянием консоли и вешает клавиатурные слушатели:
 * ⌘K/Ctrl+K переключают консоль из любого места, Escape — закрывает.
 *
 * При открытии запоминает активный элемент и возвращает ему фокус при закрытии —
 * чтобы клавиатурная навигация не «терялась» после консоли.
 */
export function ConsoleProvider({ children }: ConsoleProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  const open = useCallback(() => {
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    openerRef.current?.focus();
    openerRef.current = null;
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((current) => {
      if (current) {
        openerRef.current?.focus();
        openerRef.current = null;
        return false;
      }
      openerRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      return true;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (isToggleShortcut(event)) {
        event.preventDefault();
        toggle();
        return;
      }
      if (event.key === 'Escape' && isOpen) {
        close();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, toggle, close]);

  const value = useMemo<ConsoleContextValue>(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>;
}

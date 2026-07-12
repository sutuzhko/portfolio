import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  ThemeContext,
  type ThemeContextValue,
  type ThemeMode,
  defaultThemeMode,
  themeStorageKey,
} from './theme-context';

function readInitialMode(): ThemeMode {
  // Тему уже мог выставить бутстрап-скрипт в index.html — берём её, чтобы не было рассинхрона.
  const fromDom = document.documentElement.dataset.theme;
  return fromDom === 'light' || fromDom === 'dark' ? fromDom : defaultThemeMode;
}

interface ThemeProviderProps {
  readonly children: ReactNode;
}

/** Явный выбор темы пользователем — сохраняем в localStorage (переживает перезагрузку). */
function persistChoice(mode: ThemeMode): void {
  try {
    localStorage.setItem(themeStorageKey, mode);
  } catch {
    /* приватный режим браузера — просто не сохраняем выбор */
  }
}

/** Хранит выбранную тему и синхронизирует её с <html data-theme>. */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(readInitialMode);

  // Только визуальная синхронизация; запись выбора в localStorage — в setMode/toggle,
  // чтобы применение системной темы или темы по умолчанию не выглядело как выбор.
  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    persistChoice(next);
    setModeState(next);
  }, []);

  const toggle = useCallback(() => {
    setModeState((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      persistChoice(next);
      return next;
    });
  }, []);

  const applyDefaultMode = useCallback((next: ThemeMode) => setModeState(next), []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, toggle, setMode, applyDefaultMode }),
    [mode, toggle, setMode, applyDefaultMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

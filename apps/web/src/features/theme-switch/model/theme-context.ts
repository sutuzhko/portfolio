import { createContext, useContext } from 'react';

export type ThemeMode = 'dark' | 'light';

/**
 * Ключ localStorage с ЯВНЫМ выбором темы (синхронизирован с бутстрап-скриптом в
 * index.html). Пишется ТОЛЬКО при ручном переключении темы пользователем — поэтому
 * по его наличию отличаем «гость не выбирал» от «выбрал». Применение темы по
 * умолчанию/системной сюда НЕ пишет.
 */
export const themeStorageKey = 'portfolio.theme';

export const defaultThemeMode: ThemeMode = 'dark';

export interface ThemeContextValue {
  readonly mode: ThemeMode;
  readonly toggle: () => void;
  readonly setMode: (mode: ThemeMode) => void;
  /**
   * Применить тему без пометки как выбор пользователя (системная `prefers-color-scheme`
   * или `settings.defaultTheme` для нового гостя). В localStorage не пишет.
   */
  readonly applyDefaultMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Доступ к теме. Бросает, если вызван вне ThemeProvider — это ошибка композиции. */
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new Error('useTheme должен использоваться внутри ThemeProvider');
  }
  return value;
}

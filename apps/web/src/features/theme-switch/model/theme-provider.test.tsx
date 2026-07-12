import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { themeStorageKey, useTheme } from './theme-context';
import { ThemeProvider } from './theme-provider';

function wrapper({ children }: { readonly children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

afterEach(() => {
  localStorage.removeItem(themeStorageKey);
  delete document.documentElement.dataset.theme;
});

describe('ThemeProvider', () => {
  it('setMode — явный выбор: применяет тему И сохраняет её в localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setMode('light'));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(themeStorageKey)).toBe('light');
  });

  it('applyDefaultMode — тема по умолчанию/системная: применяет, но НЕ помечает как выбор', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.applyDefaultMode('light'));

    expect(document.documentElement.dataset.theme).toBe('light');
    // Ключевое: не пишем в localStorage → гость не считается «выбравшим тему».
    expect(localStorage.getItem(themeStorageKey)).toBeNull();
  });
});

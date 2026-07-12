import { useEffect, useState } from 'react';

// Эвристика «есть аппаратная клавиатура»: точный указатель + доступный hover.
// Телефоны/планшеты — грубый указатель без hover, поэтому клавиатурных шорткатов у них нет.
const KEYBOARD_QUERY = '(hover: hover) and (pointer: fine)';

/**
 * Есть ли у устройства аппаратная клавиатура. На тач-устройствах — false,
 * поэтому клавиатурные подсказки (⌘K и т.п.) там не показываем. Реагирует на
 * смену устройства ввода (подключили/отключили мышь/клавиатуру).
 */
export function useHasKeyboard(): boolean {
  const [hasKeyboard, setHasKeyboard] = useState(() => window.matchMedia(KEYBOARD_QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(KEYBOARD_QUERY);
    const update = (): void => setHasKeyboard(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return hasKeyboard;
}

/** Ярлык открытия консоли под платформу: `⌘K` на macOS, `Ctrl+K` на остальных. */
export function consoleShortcut(): string {
  return /mac/i.test(navigator.platform) ? '⌘K' : 'Ctrl+K';
}

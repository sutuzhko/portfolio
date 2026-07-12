/**
 * Константы героя. Хэндл и «начинка» терминала — не переводимый флейвор-контент,
 * живёт в конфиге рядом с виджетом, а не в i18n.
 */

/** Размер аватара героя, px. */
export const HERO_AVATAR_SIZE = 66;

/** Заголовок терминал-карточки (как в макете). */
export const TERMINAL_TITLE = 'bash — ~';

/** Промпт-пользователь в терминале. */
export const TERMINAL_USER = 'visitor@portfolio';

/** Пары «команда → вывод» в теле терминала. */
export const TERMINAL_LINES: readonly { readonly cmd: string; readonly output: string }[] = [
  { cmd: 'whoami', output: 'bogdan.sutuzhko · fullstack' },
  { cmd: 'cat stack.txt', output: 'React · Vue 3 · Node · TypeScript' },
];

/** Строка `location`: префикс/суффикс статичны, между ними — живые часы (МСК). */
export const TERMINAL_LOCATION = {
  cmd: 'location',
  prefix: 'Москва · UTC+3 · ',
  suffix: ' · English C1',
} as const;

/** Глиф консоли (шорткат — платформозависимый, см. `shared/lib/consoleShortcut`). */
export const CONSOLE_GLYPH = '>_';

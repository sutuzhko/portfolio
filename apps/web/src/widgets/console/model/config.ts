import { routePaths } from '@/shared/config';

/**
 * Флейвор терминала консоли — статичные ASCII-арты и справочник роутов.
 * Это код (глифы и токены путей), а не пользовательский контент, поэтому
 * живёт в конфиге рядом с фичей, а не в i18n.
 */

/** Пользователь в приглашении терминала (`visitor@portfolio:~$`). */
export const CONSOLE_USER = 'visitor@portfolio';

/** Заголовок окна консоли: `bash — <route>`. Часть до пути — код-токен. */
export const CONSOLE_TITLE_PREFIX = 'bash — ';

// ASCII-арт хранится построчно в одинарных кавычках: в фигурном шрифте есть
// бэктик, который сломал бы template literal, поэтому массив надёжнее.
// Обратные слеши экранированы (`\\`), при выводе получается одинарный `\`.

/** Крупный баннер `WELCOME` в приветствии консоли (figlet Standard). */
export const WELCOME_BANNER = [
  '__        __   _',
  '\\ \\      / /__| | ___ ___  _ __ ___   ___',
  " \\ \\ /\\ / / _ \\ |/ __/ _ \\| '_ ` _ \\ / _ \\",
  '  \\ V  V /  __/ | (_| (_) | | | | | |  __/',
  '   \\_/\\_/ \\___|_|\\___\\___/|_| |_| |_|\\___|',
].join('\n');

/** Компактный арт команды `ascii`. */
export const ASCII_ART = [
  ' ____   ____',
  '| __ ) / ___|   bogdan.sutuzhko',
  '|  _ \\ \\___ \\   fullstack dev',
  '| |_) | ___) |  vue · react · node',
  '|____/ |____/',
].join('\n');

/** Строка `uname` (короткая) и `uname -a` (полная) — флейвор «системы». */
export const UNAME = 'PortfolioOS';
export const UNAME_ALL = 'PortfolioOS 1.0.0 github-dark · React · TypeScript · Vite · bash';

/** Роут, доступный команде `cd` и списку `ls`: токен + реальный путь. */
export interface NavRoute {
  readonly token: string;
  readonly path: string;
}

/** Пользователь-навигируемые роуты («каталоги»). Единственный источник для `cd`/`ls`. */
export const NAV_ROUTES: readonly NavRoute[] = [
  { token: 'home', path: routePaths.home },
  { token: 'projects', path: routePaths.projects },
  { token: 'experience', path: routePaths.experience },
  { token: 'contact', path: routePaths.contact },
  // Приватная зона: гостя `cd database`/`cd admin` уведёт на /login через гард.
  { token: 'database', path: routePaths.database },
  { token: 'admin', path: routePaths.admin },
];

/** «Каталоги» терминала (навигируемые разделы) для `ls`. */
export const FS_DIRS = ['projects', 'experience', 'contact', 'database', 'admin'] as const;

/** «Файлы» терминала для `ls`/`cat`. Содержимое собирается из профиля. */
export const FS_FILES = [
  'about.md',
  'stack.txt',
  'skills.txt',
  'contact.txt',
  'resume.pdf',
] as const;

/** Убирает протокол/`mailto:`/`www.`/хвостовой слэш — для человекочитаемого url. */
export function cleanUrl(url: string): string {
  return url
    .replace(/^mailto:/, '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}

/**
 * Приводит пользовательский ввод (`/projects`, `projects`, `Home`) к пути
 * приложения. Пустой ввод и `home` ведут на главную. Неизвестный роут → `null`.
 */
export function resolveRoute(input: string): string | null {
  const token = input.trim().replace(/^\/+/, '').toLowerCase();
  if (token === '' || token === 'home') return routePaths.home;
  return NAV_ROUTES.find((route) => route.token === token)?.path ?? null;
}

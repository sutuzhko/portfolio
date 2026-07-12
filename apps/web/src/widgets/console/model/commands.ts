import type { TFunction } from 'i18next';

import type { Profile } from '@/entities/profile';
import type { ThemeMode } from '@/features/theme-switch';
import type { ToastOptions } from '@/features/toaster';
import { routePaths, type AppLanguage } from '@/shared/config';
import { moscowTime } from '@/shared/lib';
import type { ToastType } from '@sutuzhko/ui-kit';

import {
  ASCII_ART,
  CONSOLE_USER,
  FS_DIRS,
  FS_FILES,
  UNAME,
  UNAME_ALL,
  cleanUrl,
  resolveRoute,
} from './config';

/**
 * Единый реестр команд консоли. Одно место владеет всем поведением терминала —
 * добавление команды не требует правок в UI. Раннеры (2048) и тосты подключат
 * свои команды сюда же по мере готовности фич.
 */

/** Строка истории консоли: приветствие, эхо ввода, вывод текста или справка. */
export type ConsoleEntry =
  | { readonly id: number; readonly kind: 'welcome' }
  | { readonly id: number; readonly kind: 'input'; readonly text: string }
  | { readonly id: number; readonly kind: 'text'; readonly body: string }
  | { readonly id: number; readonly kind: 'help' };

/** Сервисы приложения, которые команды дёргают через контекст. */
export interface CommandServices {
  readonly t: TFunction;
  readonly profile: Profile | undefined;
  /** Текущий путь маршрута (для `pwd`). */
  readonly currentPath: string;
  /** Текущий язык приложения (для локали `date`). */
  readonly language: AppLanguage;
  readonly navigate: (path: string) => void;
  readonly setTheme: (mode: ThemeMode) => void;
  readonly toggleTheme: () => void;
  readonly downloadCv: () => void;
  /** Открыть внешний URL (для `open`). */
  readonly openUrl: (url: string) => void;
  /** Показать тост-уведомление (для `notify`). */
  readonly notify: (options: ToastOptions) => void;
  /**
   * Запустить проект по его команде (для `run`). Возвращает название запущенного
   * проекта или `null`, если запускаемого проекта с такой командой нет.
   */
  readonly runProject: (command: string) => string | null;
  /** Доступен ли роут (для `cd`/`ls` — выключенные страницы «не существуют»). */
  readonly isRouteEnabled: (path: string) => boolean;
  /** Закрыть консоль (для `cd`/`exit`). */
  readonly close: () => void;
}

/** Контекст выполнения одной команды: сервисы + разобранный ввод + вывод. */
export interface CommandContext extends CommandServices {
  /** Токены ввода после имени команды (`theme dark` → `['dark']`). */
  readonly args: readonly string[];
  /** История введённых команд (для `history`). */
  readonly history: readonly string[];
  /** Добавить в ленту строку текстового вывода. */
  readonly print: (body: string) => void;
  /** Добавить в ленту таблицу справки. */
  readonly printHelp: () => void;
  /** Очистить ленту (команда `clear`). */
  readonly clear: () => void;
}

export interface CommandDefinition {
  readonly name: string;
  readonly aliases?: readonly string[];
  /** Токен для левой колонки справки (`theme [dark|light]`). */
  readonly usage: string;
  /** i18n-ключ описания для правой колонки справки. */
  readonly descriptionKey: string;
  readonly run: (context: CommandContext) => void;
}

const THEME_MODES: readonly ThemeMode[] = ['dark', 'light'];

function isThemeMode(value: string | undefined): value is ThemeMode {
  return THEME_MODES.includes(value as ThemeMode);
}

/** Первый аргумент `notify` может быть уровнем тоста (со синонимами ok/warn/err). */
const TOAST_TYPE_BY_TOKEN: Record<string, ToastType> = {
  info: 'info',
  success: 'success',
  ok: 'success',
  warning: 'warning',
  warn: 'warning',
  error: 'error',
  err: 'error',
};

function parseToastType(token: string | undefined): ToastType | undefined {
  if (token === undefined) return undefined;
  return TOAST_TYPE_BY_TOKEN[token.toLowerCase()];
}

/** Содержимое «файла» терминала: строка, `null` — профиль ещё грузится, `undefined` — нет файла. */
function readVirtualFile(file: string, profile: Profile | undefined): string | null | undefined {
  switch (file) {
    case 'stack.txt':
      return profile ? profile.heroStack.join(' · ') : null;
    case 'about.md':
      return profile ? profile.bioMarkdown : null;
    case 'skills.txt':
      return profile ? profile.highlights.map((h) => `${h.value}\t${h.label}`).join('\n') : null;
    case 'contact.txt':
      return profile
        ? profile.contacts.map((c) => `${c.icon}\t${cleanUrl(c.url)}`).join('\n')
        : null;
    default:
      return undefined;
  }
}

export const COMMANDS: readonly CommandDefinition[] = [
  {
    name: 'help',
    usage: 'help',
    descriptionKey: 'console.help.rows.help',
    run: (ctx) => ctx.printHelp(),
  },
  {
    name: 'man',
    usage: 'man <command>',
    descriptionKey: 'console.help.rows.man',
    run: (ctx) => {
      const [name] = ctx.args;
      if (!name) {
        ctx.print(ctx.t('console.msg.manUsage'));
        return;
      }
      const command = findCommand(name);
      if (!command) {
        ctx.print(ctx.t('console.msg.manNotFound', { command: name }));
        return;
      }
      ctx.print(`${command.usage}\n    ${ctx.t(command.descriptionKey)}`);
    },
  },
  {
    name: 'ls',
    usage: 'ls',
    descriptionKey: 'console.help.rows.ls',
    run: (ctx) => {
      const files = FS_FILES.join('   ');
      // Выключенные страницы не показываем — как будто каталога нет.
      const dirs = FS_DIRS.filter((dir) => {
        const path = resolveRoute(dir);
        return path === null || ctx.isRouteEnabled(path);
      })
        .map((dir) => `${dir}/`)
        .join('   ');
      ctx.print(`${files}\n${dirs}`);
    },
  },
  {
    name: 'cd',
    aliases: ['go'],
    usage: 'cd <dir>',
    descriptionKey: 'console.help.rows.cd',
    run: (ctx) => {
      const target = ctx.args[0];
      const toHome = target === undefined || target === '~' || target === '/' || target === '..';
      const path = toHome ? routePaths.home : resolveRoute(target);
      // Выключенная страница ведёт себя как несуществующий каталог.
      if (path === null || !ctx.isRouteEnabled(path)) {
        ctx.print(ctx.t('console.msg.cdNotFound', { path: target }));
        return;
      }
      ctx.print(ctx.t('console.msg.navigating', { route: path }));
      ctx.navigate(path);
      ctx.close();
    },
  },
  {
    name: 'pwd',
    usage: 'pwd',
    descriptionKey: 'console.help.rows.pwd',
    run: (ctx) => ctx.print(ctx.currentPath),
  },
  {
    name: 'cat',
    usage: 'cat <file>',
    descriptionKey: 'console.help.rows.cat',
    run: (ctx) => {
      const [file] = ctx.args;
      if (!file) {
        ctx.print(ctx.t('console.msg.catMissing'));
        return;
      }
      if (file === 'resume.pdf') {
        ctx.print(ctx.t('console.msg.catBinary', { file }));
        return;
      }
      const content = readVirtualFile(file, ctx.profile);
      if (content === undefined) {
        ctx.print(ctx.t('console.msg.catNotFound', { file }));
        return;
      }
      ctx.print(content ?? ctx.t('console.msg.loading'));
    },
  },
  {
    name: 'whoami',
    usage: 'whoami',
    descriptionKey: 'console.help.rows.whoami',
    run: (ctx) => {
      const { profile } = ctx;
      if (!profile) {
        ctx.print(ctx.t('console.msg.loading'));
        return;
      }
      ctx.print(
        [
          `${profile.name} — ${profile.roleTitle}`,
          profile.heroStack.join(' · '),
          profile.location,
          profile.headline,
        ].join('\n'),
      );
    },
  },
  {
    name: 'location',
    usage: 'location',
    descriptionKey: 'console.help.rows.location',
    run: (ctx) => {
      if (!ctx.profile) {
        ctx.print(ctx.t('console.msg.loading'));
        return;
      }
      ctx.print(`${ctx.profile.location} · ${moscowTime()} MSK`);
    },
  },
  {
    name: 'date',
    usage: 'date',
    descriptionKey: 'console.help.rows.date',
    run: (ctx) => {
      const formatted = new Intl.DateTimeFormat(ctx.language === 'ru' ? 'ru-RU' : 'en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Moscow',
      }).format(new Date());
      ctx.print(`${formatted} MSK`);
    },
  },
  {
    name: 'echo',
    usage: 'echo <text>',
    descriptionKey: 'console.help.rows.echo',
    run: (ctx) => ctx.print(ctx.args.join(' ')),
  },
  {
    name: 'history',
    usage: 'history',
    descriptionKey: 'console.help.rows.history',
    run: (ctx) => {
      const lines = ctx.history.map((cmd, index) => `${String(index + 1).padStart(3)}  ${cmd}`);
      ctx.print(lines.join('\n'));
    },
  },
  {
    name: 'uname',
    usage: 'uname [-a]',
    descriptionKey: 'console.help.rows.uname',
    run: (ctx) => ctx.print(ctx.args[0] === '-a' ? UNAME_ALL : UNAME),
  },
  {
    name: 'neofetch',
    usage: 'neofetch',
    descriptionKey: 'console.help.rows.neofetch',
    run: (ctx) => {
      const info = [CONSOLE_USER, '-'.repeat(17)];
      if (ctx.profile) {
        info.push(
          `Host: ${ctx.profile.name}`,
          `Role: ${ctx.profile.roleTitle}`,
          `Stack: ${ctx.profile.heroStack.join(' · ')}`,
          `Location: ${ctx.profile.location}`,
        );
      }
      info.push(`OS: ${UNAME_ALL}`, 'Shell: bash');
      ctx.print(`${ASCII_ART}\n\n${info.join('\n')}`);
    },
  },
  {
    name: 'theme',
    usage: 'theme [dark|light]',
    descriptionKey: 'console.help.rows.theme',
    run: (ctx) => {
      const mode = ctx.args[0]?.toLowerCase();
      if (mode === undefined) {
        ctx.toggleTheme();
        ctx.print(ctx.t('console.msg.themeToggle'));
        return;
      }
      if (isThemeMode(mode)) {
        ctx.setTheme(mode);
        ctx.print(ctx.t('console.msg.themeSet', { mode }));
        return;
      }
      ctx.print(ctx.t('console.msg.themeUsage'));
    },
  },
  {
    name: 'open',
    usage: 'open <channel>',
    descriptionKey: 'console.help.rows.open',
    run: (ctx) => {
      const channel = ctx.args[0]?.toLowerCase();
      if (!channel) {
        ctx.print(ctx.t('console.msg.openMissing'));
        return;
      }
      const contact = ctx.profile?.contacts.find((item) => item.icon.toLowerCase() === channel);
      if (!contact) {
        ctx.print(ctx.t('console.msg.openUnknown', { channel }));
        return;
      }
      ctx.print(ctx.t('console.msg.openDone', { channel }));
      ctx.openUrl(contact.url);
    },
  },
  {
    name: 'notify',
    usage: 'notify [type] <text>',
    descriptionKey: 'console.help.rows.notify',
    run: (ctx) => {
      // Первый токен — необязательный уровень; остальное (или всё) — текст тоста.
      const type = parseToastType(ctx.args[0]);
      const text = (type ? ctx.args.slice(1) : ctx.args).join(' ').trim();
      if (!text) {
        ctx.print(ctx.t('console.msg.notifyUsage'));
        return;
      }
      ctx.notify({ type: type ?? 'info', title: text });
      ctx.print(ctx.t('console.msg.notifyDone'));
    },
  },
  {
    name: 'run',
    usage: 'run <project>',
    descriptionKey: 'console.help.rows.run',
    run: (ctx) => {
      if (ctx.args.length === 0) {
        ctx.print(ctx.t('console.msg.runUsage'));
        return;
      }
      // Проекты хранят полную команду (`run 2048`) — восстанавливаем её из ввода.
      const command = ['run', ...ctx.args].join(' ');
      const project = ctx.runProject(command);
      if (project === null) {
        ctx.print(ctx.t('console.msg.runNotFound', { command: ctx.args.join(' ') }));
        return;
      }
      ctx.print(ctx.t('console.msg.runLaunching', { project }));
    },
  },
  {
    name: 'resume',
    aliases: ['cv'],
    usage: 'resume',
    descriptionKey: 'console.help.rows.resume',
    run: (ctx) => {
      ctx.print(ctx.t('console.msg.resume'));
      ctx.downloadCv();
    },
  },
  {
    name: 'sudo',
    usage: 'sudo',
    descriptionKey: 'console.help.rows.sudo',
    run: (ctx) => ctx.print(ctx.t('console.msg.sudo')),
  },
  {
    name: 'clear',
    usage: 'clear',
    descriptionKey: 'console.help.rows.clear',
    run: (ctx) => ctx.clear(),
  },
  {
    name: 'exit',
    usage: 'exit',
    descriptionKey: 'console.help.rows.exit',
    run: (ctx) => {
      ctx.print(ctx.t('console.msg.exit'));
      ctx.close();
    },
  },
];

const COMMAND_BY_NAME = new Map<string, CommandDefinition>(
  COMMANDS.flatMap((command) => [
    [command.name, command] as const,
    ...(command.aliases ?? []).map((alias) => [alias, command] as const),
  ]),
);

/** Ищет команду по имени или алиасу (регистронезависимо). */
export function findCommand(name: string): CommandDefinition | undefined {
  return COMMAND_BY_NAME.get(name.toLowerCase());
}

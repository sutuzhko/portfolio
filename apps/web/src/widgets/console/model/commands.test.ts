import { describe, expect, it, vi } from 'vitest';

import { mockProfile } from '@/entities/profile/mocks';
import { setupI18n } from '@/shared/config';

import { COMMANDS, findCommand, type CommandContext } from './commands';
import type { Profile } from '@/entities/profile';

const t = setupI18n().getFixedT('ru');

interface RunOptions {
  // `null` = «профиль ещё не загружен» (передача `undefined` сработала бы как дефолт).
  readonly profile?: Profile | null;
  readonly currentPath?: string;
  readonly history?: readonly string[];
  /** Гейт видимости роутов (для `cd`/`ls`); по умолчанию всё доступно. */
  readonly isRouteEnabled?: (path: string) => boolean;
}

function run(input: string, options: RunOptions = {}) {
  const {
    profile = mockProfile,
    currentPath = '/',
    history = [],
    isRouteEnabled = () => true,
  } = options;
  const [name, ...args] = input.split(/\s+/);
  const printed: string[] = [];
  const state = { helpShown: false, cleared: false };
  const spies = {
    navigate: vi.fn(),
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    downloadCv: vi.fn(),
    openUrl: vi.fn(),
    notify: vi.fn(),
    // Знает только про «run 2048»: возвращает название проекта либо null.
    runProject: vi.fn((command: string) => (command === 'run 2048' ? 'Игра: 2048' : null)),
    close: vi.fn(),
  };
  const context: CommandContext = {
    t,
    profile: profile ?? undefined,
    currentPath,
    language: 'ru',
    isRouteEnabled,
    args,
    history,
    print: (body) => printed.push(body),
    printHelp: () => {
      state.helpShown = true;
    },
    clear: () => {
      state.cleared = true;
    },
    ...spies,
  };
  findCommand(name)?.run(context);
  return { printed, state, ...spies };
}

describe('реестр команд консоли', () => {
  it('находит команду по имени и алиасу (регистронезависимо)', () => {
    expect(findCommand('help')?.name).toBe('help');
    expect(findCommand('CV')?.name).toBe('resume');
    expect(findCommand('go')?.name).toBe('cd');
    expect(findCommand('unknown')).toBeUndefined();
  });

  it('у каждой команды справки есть переводимое описание', () => {
    for (const command of COMMANDS) {
      expect(t(command.descriptionKey)).not.toBe(command.descriptionKey);
    }
  });

  it('theme dark|light устанавливает тему, без аргумента — переключает', () => {
    expect(run('theme dark').setTheme).toHaveBeenCalledWith('dark');
    expect(run('theme light').setTheme).toHaveBeenCalledWith('light');
    expect(run('theme').toggleTheme).toHaveBeenCalled();
    const bad = run('theme wat');
    expect(bad.setTheme).not.toHaveBeenCalled();
    expect(bad.printed[0]).toContain('theme');
  });

  it('cd переходит в известный раздел и закрывает консоль', () => {
    const result = run('cd projects');
    expect(result.navigate).toHaveBeenCalledWith('/projects');
    expect(result.close).toHaveBeenCalled();
  });

  it('cd без аргумента ведёт на главную', () => {
    expect(run('cd').navigate).toHaveBeenCalledWith('/');
  });

  it('cd в несуществующий раздел не навигирует и печатает ошибку', () => {
    const result = run('cd nope');
    expect(result.navigate).not.toHaveBeenCalled();
    expect(result.printed[0]).toContain('cd:');
  });

  it('cd в выключенную страницу ведёт себя как несуществующий раздел', () => {
    const result = run('cd projects', { isRouteEnabled: (path) => path !== '/projects' });
    expect(result.navigate).not.toHaveBeenCalled();
    expect(result.printed[0]).toContain('cd:');
  });

  it('ls скрывает выключенные страницы', () => {
    const result = run('ls', { isRouteEnabled: (path) => path !== '/experience' });
    const output = result.printed.join('\n');
    expect(output).toContain('projects/');
    expect(output).not.toContain('experience/');
  });

  it('pwd печатает текущий путь', () => {
    expect(run('pwd', { currentPath: '/projects' }).printed[0]).toBe('/projects');
  });

  it('ls перечисляет файлы и разделы', () => {
    const printed = run('ls').printed[0];
    expect(printed).toContain('stack.txt');
    expect(printed).toContain('projects/');
  });

  it('cat выводит файлы и корректно обрабатывает ошибки', () => {
    expect(run('cat stack.txt').printed[0]).toContain('React');
    expect(run('cat about.md').printed[0]).toContain(mockProfile.bioMarkdown.slice(0, 10));
    expect(run('cat resume.pdf').printed[0]).toContain('resume');
    expect(run('cat nope.txt').printed[0]).toContain('cat:');
    expect(run('cat').printed[0]).toContain('cat:');
  });

  it('echo возвращает переданный текст', () => {
    expect(run('echo hello world').printed[0]).toBe('hello world');
  });

  it('whoami печатает данные профиля, без профиля — подсказку о загрузке', () => {
    expect(run('whoami').printed[0]).toContain(mockProfile.name);
    expect(run('whoami', { profile: null }).printed[0]).toBe(t('console.msg.loading'));
  });

  it('location и date показывают место/время', () => {
    expect(run('location').printed[0]).toContain(mockProfile.location);
    expect(run('date').printed[0]).toContain('MSK');
  });

  it('history печатает список введённых команд', () => {
    const printed = run('history', { history: ['whoami', 'ls', 'history'] }).printed[0];
    expect(printed).toContain('whoami');
    expect(printed).toContain('ls');
  });

  it('uname печатает систему, -a — подробности', () => {
    expect(run('uname').printed[0]).toBe('PortfolioOS');
    expect(run('uname -a').printed[0]).toContain('React');
  });

  it('man показывает справку по команде', () => {
    expect(run('man ls').printed[0]).toContain('ls');
    expect(run('man nope').printed[0]).toContain('man:');
    expect(run('man').printed[0]).toContain('man:');
  });

  it('open открывает контакт по каналу', () => {
    const github = mockProfile.contacts.find((c) => c.icon === 'github');
    const result = run('open github');
    expect(result.openUrl).toHaveBeenCalledWith(github?.url);
    expect(run('open nope').openUrl).not.toHaveBeenCalled();
    expect(run('open').printed[0]).toContain('open:');
  });

  it('resume скачивает CV', () => {
    expect(run('resume').downloadCv).toHaveBeenCalled();
    expect(run('cv').downloadCv).toHaveBeenCalled();
  });

  it('notify показывает тост: разбирает уровень, иначе info; без текста — usage', () => {
    const warn = run('notify warning проверьте данные');
    expect(warn.notify).toHaveBeenCalledWith({ type: 'warning', title: 'проверьте данные' });
    expect(warn.printed[0]).toBe(t('console.msg.notifyDone'));

    const plain = run('notify привет мир');
    expect(plain.notify).toHaveBeenCalledWith({ type: 'info', title: 'привет мир' });

    const empty = run('notify');
    expect(empty.notify).not.toHaveBeenCalled();
    expect(empty.printed[0]).toBe(t('console.msg.notifyUsage'));
  });

  it('run <project> запускает проект по команде, иначе — ошибка/usage', () => {
    const ok = run('run 2048');
    expect(ok.runProject).toHaveBeenCalledWith('run 2048');
    expect(ok.printed[0]).toContain('2048');
    const missing = run('run nope');
    expect(missing.printed[0]).toContain('nope');
    expect(run('run').printed[0]).toBe(t('console.msg.runUsage'));
  });

  it('exit закрывает консоль', () => {
    expect(run('exit').close).toHaveBeenCalled();
  });

  it('sudo и neofetch печатают статичный вывод', () => {
    expect(run('sudo').printed[0]).toContain('sudoers');
    // neofetch печатает ASCII-арт (команда `ascii` убрана как избыточная).
    expect(run('neofetch').printed[0]).toContain('bogdan.sutuzhko');
  });

  it('help и clear используют соответствующие колбэки', () => {
    expect(run('help').state.helpShown).toBe(true);
    expect(run('clear').state.cleared).toBe(true);
  });
});

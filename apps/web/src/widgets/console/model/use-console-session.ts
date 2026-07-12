import { useCallback, useRef, useState, type KeyboardEvent } from 'react';

import {
  findCommand,
  type CommandContext,
  type CommandServices,
  type ConsoleEntry,
} from './commands';

const INITIAL_ENTRIES: readonly ConsoleEntry[] = [{ id: 0, kind: 'welcome' }];

export interface ConsoleSession {
  readonly entries: readonly ConsoleEntry[];
  readonly input: string;
  readonly setInput: (value: string) => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly run: (raw: string) => void;
}

/**
 * Управляет одной сессией консоли: лента истории, текущий ввод, выполнение
 * команд и рекол ранее введённых команд стрелками ↑/↓ (как в настоящем shell).
 *
 * Команды не знают про React — они получают контекст с сервисами и колбэками
 * вывода. Вся оркестрация ленты (эхо ввода, накопление вывода, очистка) — здесь.
 */
export function useConsoleSession(services: CommandServices): ConsoleSession {
  const [entries, setEntries] = useState<readonly ConsoleEntry[]>(INITIAL_ENTRIES);
  const [input, setInput] = useState('');

  // Счётчик id для стабильных ключей ленты и история команд для рекола.
  const nextId = useRef(1);
  const commandLog = useRef<string[]>([]);
  const recallIndex = useRef<number | null>(null);

  const run = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      commandLog.current.push(trimmed);
      recallIndex.current = null;

      const [name, ...args] = trimmed.split(/\s+/);
      const outputs: ConsoleEntry[] = [{ id: nextId.current++, kind: 'input', text: trimmed }];
      let cleared = false;

      const context: CommandContext = {
        ...services,
        args,
        history: [...commandLog.current],
        print: (body) => outputs.push({ id: nextId.current++, kind: 'text', body }),
        printHelp: () => outputs.push({ id: nextId.current++, kind: 'help' }),
        clear: () => {
          cleared = true;
        },
      };

      const command = findCommand(name);
      if (command) {
        command.run(context);
      } else {
        outputs.push({
          id: nextId.current++,
          kind: 'text',
          body: services.t('console.msg.notFound', { command: name }),
        });
      }

      setEntries((prev) => (cleared ? [] : [...prev, ...outputs]));
    },
    [services],
  );

  const recall = useCallback((direction: -1 | 1) => {
    const log = commandLog.current;
    if (log.length === 0) return;

    const current = recallIndex.current ?? log.length;
    const next = Math.min(Math.max(current + direction, 0), log.length);
    recallIndex.current = next;
    setInput(next >= log.length ? '' : log[next]);
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const raw = input;
        setInput('');
        run(raw);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        recall(-1);
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        recall(1);
      }
    },
    [input, run, recall],
  );

  return { entries, input, setInput, onKeyDown, run };
}

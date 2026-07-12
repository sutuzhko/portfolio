import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { mockProfile } from '@/entities/profile/mocks';
import { setupI18n } from '@/shared/config';

import type { CommandServices } from './commands';
import { useConsoleSession } from './use-console-session';

const services: CommandServices = {
  t: setupI18n().getFixedT('ru'),
  profile: mockProfile,
  currentPath: '/',
  language: 'ru',
  navigate: vi.fn(),
  setTheme: vi.fn(),
  toggleTheme: vi.fn(),
  downloadCv: vi.fn(),
  openUrl: vi.fn(),
  notify: vi.fn(),
  runProject: vi.fn(() => null),
  isRouteEnabled: () => true,
  close: vi.fn(),
};

/** Мини-обёртка: связывает хук сессии с реальным полем ввода и лентой. */
function Harness() {
  const session = useConsoleSession(services);
  return (
    <div>
      <ul>
        {session.entries.map((entry) => (
          <li key={entry.id} data-kind={entry.kind}>
            {entry.kind === 'input' ? entry.text : entry.kind}
          </li>
        ))}
      </ul>
      <input
        aria-label="ввод"
        value={session.input}
        onChange={(event) => session.setInput(event.target.value)}
        onKeyDown={session.onKeyDown}
      />
    </div>
  );
}

function kinds(): string[] {
  return screen.getAllByRole('listitem').map((item) => item.dataset.kind ?? '');
}

describe('useConsoleSession', () => {
  it('стартует с приветствия', () => {
    render(<Harness />);
    expect(kinds()).toEqual(['welcome']);
  });

  it('выполняет команду по Enter: эхо ввода + вывод, поле очищается', async () => {
    render(<Harness />);
    const input = screen.getByLabelText('ввод');
    await userEvent.type(input, 'help{Enter}');

    expect(kinds()).toEqual(['welcome', 'input', 'help']);
    expect(input).toHaveValue('');
  });

  it('clear очищает ленту', async () => {
    render(<Harness />);
    await userEvent.type(screen.getByLabelText('ввод'), 'clear{Enter}');
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('пустой ввод игнорируется', async () => {
    render(<Harness />);
    await userEvent.type(screen.getByLabelText('ввод'), '   {Enter}');
    expect(kinds()).toEqual(['welcome']);
  });

  it('стрелки ↑/↓ вызывают ранее введённые команды', async () => {
    render(<Harness />);
    const input = screen.getByLabelText('ввод');
    await userEvent.type(input, 'whoami{Enter}');
    await userEvent.type(input, 'ls{Enter}');

    await userEvent.type(input, '{ArrowUp}');
    expect(input).toHaveValue('ls');
    await userEvent.type(input, '{ArrowUp}');
    expect(input).toHaveValue('whoami');
    await userEvent.type(input, '{ArrowDown}');
    expect(input).toHaveValue('ls');
    await userEvent.type(input, '{ArrowDown}');
    expect(input).toHaveValue('');
  });
});

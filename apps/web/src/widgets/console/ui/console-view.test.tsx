import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockProfile } from '@/entities/profile/mocks';

import { COMMANDS, type ConsoleEntry } from '../model/commands';

import { ConsoleView, type ConsoleViewProps, type ConsoleWindowState } from './console-view';

function renderView(overrides: Partial<ConsoleViewProps> = {}) {
  const props: ConsoleViewProps = {
    isOpen: true,
    windowState: 'normal' satisfies ConsoleWindowState,
    routeLabel: '~',
    entries: [{ id: 0, kind: 'welcome' }],
    input: '',
    profile: mockProfile,
    clock: '12:00',
    onInputChange: vi.fn(),
    onInputKeyDown: vi.fn(),
    onClose: vi.fn(),
    onMinimize: vi.fn(),
    onToggleMaximize: vi.fn(),
    onRestore: vi.fn(),
    ...overrides,
  };
  return { props, ...renderWithProviders(<ConsoleView {...props} />) };
}

describe('ConsoleView', () => {
  it('закрытая консоль ничего не рендерит', () => {
    renderView({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('открытая консоль — модальный dialog с заголовком маршрута', () => {
    renderView();
    const dialog = screen.getByRole('dialog', { name: 'Консоль' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText(/bash — ~/)).toBeInTheDocument();
  });

  it('приветствие показывает данные профиля', () => {
    renderView();
    expect(screen.getByText(new RegExp(mockProfile.name))).toBeInTheDocument();
  });

  it('пока профиль грузится, приветствие показывает скелетоны', () => {
    const { container } = renderView({ profile: undefined });
    expect(container.querySelectorAll('[aria-busy="true"]').length).toBeGreaterThan(0);
    expect(screen.queryByText(new RegExp(mockProfile.name))).not.toBeInTheDocument();
  });

  it('справка выводит все команды реестра', () => {
    const entries: ConsoleEntry[] = [
      { id: 0, kind: 'welcome' },
      { id: 1, kind: 'help' },
    ];
    const { container } = renderView({ entries });
    // `whoami` встречается и в приветствии, и в справке — сверяем по списку <dt>.
    const usages = Array.from(container.querySelectorAll('dt'), (dt) => dt.textContent);
    expect(usages).toContain('theme [dark|light]');
    expect(usages).toContain('cat <file>');
    expect(usages).toHaveLength(COMMANDS.length);
  });

  it('свёрнутая консоль показывает пилюлю в трее без окна', () => {
    renderView({ windowState: 'minimized' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bash — ~/ })).toBeInTheDocument();
  });

  it('в развёрнутом состоянии кнопка меняет ярлык на «восстановить»', () => {
    renderView({ windowState: 'maximized' });
    expect(screen.getByRole('button', { name: 'Восстановить размер' })).toBeInTheDocument();
  });

  it('ввод проксирует изменения и нажатия клавиш наверх', async () => {
    const { props } = renderView();
    const input = screen.getByLabelText('Ввод команды консоли');
    await userEvent.type(input, 'x{Enter}');
    expect(props.onInputChange).toHaveBeenCalledWith('x');
    expect(props.onInputKeyDown).toHaveBeenCalled();
  });

  it('закрытие доступно и по фону, и по красному свету', async () => {
    const { props } = renderView();
    const closers = screen.getAllByRole('button', { name: 'Закрыть консоль' });
    expect(closers.length).toBeGreaterThanOrEqual(2);
    await userEvent.click(closers[0]);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('свернуть и развернуть вызывают свои колбэки', async () => {
    const { props } = renderView();
    await userEvent.click(screen.getByRole('button', { name: 'Свернуть консоль' }));
    expect(props.onMinimize).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Развернуть на всю ширину' }));
    expect(props.onToggleMaximize).toHaveBeenCalled();
  });

  it('нет нарушений доступности', async () => {
    const { container } = renderView();
    expect(await axe(container)).toHaveNoViolations();
  });
});

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';

import { TerminalCard } from './ui/terminal-card';

describe('TerminalCard', () => {
  it('рендерит команды, их вывод и строку location', () => {
    renderWithProviders(<TerminalCard onOpenConsole={() => undefined} />);
    expect(screen.getByText('whoami')).toBeInTheDocument();
    expect(screen.getByText('cat stack.txt')).toBeInTheDocument();
    expect(screen.getByText('bogdan.sutuzhko · fullstack')).toBeInTheDocument();
    expect(screen.getByText('location')).toBeInTheDocument();
    expect(screen.getByText(/English C1/)).toBeInTheDocument();
  });

  it('вызывает onOpenConsole по клику на плашку', async () => {
    const onOpenConsole = vi.fn();
    renderWithProviders(<TerminalCard onOpenConsole={onOpenConsole} />);
    await userEvent.click(screen.getByRole('button', { name: /Консоль/ }));
    expect(onOpenConsole).toHaveBeenCalledOnce();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(<TerminalCard onOpenConsole={() => undefined} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

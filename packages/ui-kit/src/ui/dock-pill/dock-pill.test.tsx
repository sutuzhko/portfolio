import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { DockPill, type DockPillProps } from './dock-pill';

function renderPill(overrides: Partial<DockPillProps> = {}) {
  const props: DockPillProps = {
    label: 'bash — ~',
    onClose: vi.fn(),
    onRestore: vi.fn(),
    onMaximize: vi.fn(),
    closeLabel: 'Закрыть',
    restoreLabel: 'Развернуть',
    maximizeLabel: 'На всю ширину',
    ...overrides,
  };
  return { props, ...render(<DockPill {...props} />) };
}

describe('DockPill', () => {
  it('показывает подпись окна', () => {
    renderPill({ label: '2048 — game' });
    expect(screen.getByRole('button', { name: '2048 — game' })).toBeInTheDocument();
  });

  it('клик по подписи разворачивает окно', async () => {
    const { props } = renderPill();
    await userEvent.click(screen.getByRole('button', { name: 'bash — ~' }));
    expect(props.onRestore).toHaveBeenCalled();
  });

  it('светофор: красный закрывает, жёлтый разворачивает, зелёный — на всю ширину', async () => {
    const { props } = renderPill();
    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }));
    expect(props.onClose).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Развернуть' }));
    expect(props.onRestore).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'На всю ширину' }));
    expect(props.onMaximize).toHaveBeenCalled();
  });

  it('без onMaximize зелёный свет тоже разворачивает', async () => {
    const { props } = renderPill({ onMaximize: undefined, maximizeLabel: 'Развернуть' });
    const [restore, maximize] = screen.getAllByRole('button', { name: 'Развернуть' });
    expect(maximize).toBeInTheDocument();
    await userEvent.click(restore);
    await userEvent.click(maximize);
    expect(props.onRestore).toHaveBeenCalledTimes(2);
  });

  it('нет нарушений доступности', async () => {
    const { container } = renderPill();
    expect(await axe(container)).toHaveNoViolations();
  });
});

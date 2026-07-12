import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TrayPortal } from './tray';

describe('TrayPortal', () => {
  it('порталит содержимое в корень трея внутри body', () => {
    render(<TrayPortal>окно</TrayPortal>);
    const root = document.querySelector('[data-tray-root]');
    expect(root).not.toBeNull();
    expect(root?.parentElement).toBe(document.body);
    expect(screen.getByText('окно')).toBeInTheDocument();
  });

  it('несколько порталов кладут пилюли в один общий контейнер', () => {
    render(
      <>
        <TrayPortal>первое</TrayPortal>
        <TrayPortal>второе</TrayPortal>
      </>,
    );
    expect(document.querySelectorAll('[data-tray-root]')).toHaveLength(1);
    const root = document.querySelector('[data-tray-root]');
    expect(root?.textContent).toContain('первое');
    expect(root?.textContent).toContain('второе');
  });
});

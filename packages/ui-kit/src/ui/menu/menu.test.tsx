import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../button';

import { Menu, MenuItem } from './menu';

function renderMenu(onSelect = vi.fn()) {
  return render(
    <Menu
      ariaLabel="Действия"
      renderTrigger={({ toggle, triggerProps }) => (
        <Button variant="ghost" onClick={toggle} {...triggerProps}>
          Меню
        </Button>
      )}
    >
      <MenuItem onClick={onSelect}>Профиль</MenuItem>
      <MenuItem danger onClick={onSelect}>
        Выйти
      </MenuItem>
    </Menu>,
  );
}

// Открытие/навигация — поведение оверлея; play в menu.stories покрывает Escape.
describe('Menu', () => {
  it('по умолчанию закрыто, панель не в документе', () => {
    renderMenu();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Меню' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('открывается по клику на триггер', async () => {
    renderMenu();
    await userEvent.click(screen.getByRole('button', { name: 'Меню' }));
    expect(screen.getByRole('menu', { name: 'Действия' })).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });

  it('вызывает обработчик пункта и закрывает меню', async () => {
    const onSelect = vi.fn();
    renderMenu(onSelect);
    await userEvent.click(screen.getByRole('button', { name: 'Меню' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Профиль' }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('закрывается по клику вне меню', async () => {
    renderMenu();
    await userEvent.click(screen.getByRole('button', { name: 'Меню' }));
    await userEvent.click(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('не нарушает доступность в открытом состоянии', async () => {
    const { container } = renderMenu();
    await userEvent.click(screen.getByRole('button', { name: 'Меню' }));
    expect(await axe(container)).toHaveNoViolations();
  });
});

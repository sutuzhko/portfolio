import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { MenuItem } from '@sutuzhko/ui-kit';

import { Navbar } from './ui/navbar';

function renderNavbar(props: Partial<Parameters<typeof Navbar>[0]> = {}) {
  return renderWithProviders(
    <MemoryRouter>
      <Navbar onOpenConsole={() => undefined} {...props} />
    </MemoryRouter>,
  );
}

describe('Navbar', () => {
  it('рендерит бренд-ссылку на главную', () => {
    renderNavbar();
    // Доступное имя = «<бренд> — На главную» (видимый бренд включён для WCAG 2.5.3).
    expect(screen.getByRole('link', { name: /На главную/ })).toHaveAttribute('href', '/');
  });

  it('вызывает onOpenConsole по клику на кнопку консоли', async () => {
    const onOpenConsole = vi.fn();
    renderNavbar({ onOpenConsole });
    await userEvent.click(screen.getByRole('button', { name: 'Открыть консоль' }));
    expect(onOpenConsole).toHaveBeenCalledOnce();
  });

  it('раскрывает меню профиля по клику, когда пункты заданы', async () => {
    renderNavbar({ profileMenu: <MenuItem>Профиль</MenuItem> });
    await userEvent.click(screen.getByRole('button', { name: 'Меню профиля' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Профиль' })).toBeInTheDocument();
  });

  it('без меню вызывает onProfileClick', async () => {
    const onProfileClick = vi.fn();
    renderNavbar({ onProfileClick });
    await userEvent.click(screen.getByRole('button', { name: 'Меню профиля' }));
    expect(onProfileClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderNavbar();
    expect(await axe(container)).toHaveNoViolations();
  });
});

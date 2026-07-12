import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockDatabaseTree } from '@/entities/kb/mocks';

import { KbLibrary } from './kb-library';

function renderLibrary(overrides: Partial<Parameters<typeof KbLibrary>[0]> = {}) {
  const props = {
    tree: mockDatabaseTree,
    selectedSlug: null,
    onSelectArticle: vi.fn(),
    onNewArticle: vi.fn(),
    onCreateFolder: vi.fn(),
    onRenameFolder: vi.fn(),
    onRenameArticle: vi.fn(),
    onMoveFolder: vi.fn(),
    onMoveArticle: vi.fn(),
    onDeleteFolder: vi.fn(),
    onDeleteArticle: vi.fn(),
    ...overrides,
  };
  return { ...renderWithProviders(<KbLibrary {...props} />), props };
}

describe('KbLibrary', () => {
  it('рисует дерево, счётчики и раскрытые по умолчанию папки', () => {
    renderLibrary();
    expect(screen.getByText('2 папок · 4 статей')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Хуки React')).toBeInTheDocument();
  });

  it('клик по статье вызывает onSelectArticle со slug', async () => {
    const { props } = renderLibrary();
    await userEvent.click(screen.getByRole('button', { name: /Хуки React/ }));
    expect(props.onSelectArticle).toHaveBeenCalledWith('react-hooks');
  });

  it('сворачивание папки прячет её статьи', async () => {
    renderLibrary();
    await userEvent.click(screen.getByRole('button', { name: /Frontend/ }));
    expect(screen.queryByText('Хуки React')).not.toBeInTheDocument();
  });

  it('форма новой папки создаёт папку в корне', async () => {
    const { props } = renderLibrary();
    await userEvent.click(screen.getByRole('button', { name: 'Новая папка' }));
    await userEvent.type(screen.getByPlaceholderText('Название папки'), 'Backend');
    await userEvent.click(screen.getByRole('button', { name: 'Создать' }));
    expect(props.onCreateFolder).toHaveBeenCalledWith('Backend', null);
  });

  it('«Новая статья» открывает редактор в корне', async () => {
    const { props } = renderLibrary();
    await userEvent.click(screen.getByRole('button', { name: 'Новая статья' }));
    expect(props.onNewArticle).toHaveBeenCalledWith(null);
  });

  it('переименование без правки не шлёт мутацию (гейт «только при изменениях»)', async () => {
    const { props } = renderLibrary();
    const [firstMenu] = screen.getAllByRole('button', { name: 'Действия' });
    if (!firstMenu) throw new Error('нет кнопки меню узла');
    await userEvent.click(firstMenu);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Переименовать' }));
    // Коммитим без изменения значения — мутация не должна уйти.
    await userEvent.click(screen.getByRole('button', { name: 'Переименовать' }));
    expect(props.onRenameFolder).not.toHaveBeenCalled();
  });

  it('удаление из меню зовёт onDeleteFolder', async () => {
    const { props } = renderLibrary();
    const [firstMenu] = screen.getAllByRole('button', { name: 'Действия' });
    if (!firstMenu) throw new Error('нет кнопки меню узла');
    await userEvent.click(firstMenu);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Удалить' }));
    expect(props.onDeleteFolder).toHaveBeenCalledTimes(1);
  });

  it('не нарушает доступность', async () => {
    const { container } = renderLibrary();
    expect(await axe(container)).toHaveNoViolations();
  });
});

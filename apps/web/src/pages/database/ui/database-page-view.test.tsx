import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockArticle, mockDatabaseTree } from '@/entities/kb/mocks';

import { DatabasePageView, type DatabasePageViewProps } from './database-page-view';

function renderView(props: Partial<DatabasePageViewProps> = {}) {
  return renderWithProviders(
    <DatabasePageView
      tree={mockDatabaseTree}
      article={mockArticle}
      selectedSlug="react-hooks"
      onSelectArticle={vi.fn()}
      onBack={vi.fn()}
      {...props}
    />,
  );
}

describe('DatabasePageView', () => {
  it('рендерит заголовок, крошку и обе панели', () => {
    renderView();
    expect(screen.getByRole('heading', { name: 'База знаний' })).toBeInTheDocument();
    expect(screen.getByText('~/database')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Хуки React')).toBeInTheDocument();
  });

  it('кнопка «назад» вызывает onBack', async () => {
    const onBack = vi.fn();
    renderView({ onBack });
    await userEvent.click(screen.getByRole('button', { name: /cd ~/ }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('при ошибке дерева показывает ошибку уровня страницы вместо панелей', () => {
    renderView({ isTreeError: true, onRetryTree: vi.fn() });
    expect(screen.getByText('Не удалось загрузить базу знаний')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});

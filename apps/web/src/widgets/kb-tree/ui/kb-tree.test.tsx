import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockDatabaseTree } from '@/entities/kb/mocks';

import { KbTree } from './kb-tree';

describe('KbTree', () => {
  it('рендерит папки и статьи дерева', () => {
    renderWithProviders(<KbTree tree={mockDatabaseTree} onSelectArticle={vi.fn()} />);

    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Хуки React')).toBeInTheDocument();
    expect(screen.getByText('О базе знаний')).toBeInTheDocument();
  });

  it('клик по статье вызывает onSelectArticle с её slug', async () => {
    const onSelect = vi.fn();
    renderWithProviders(<KbTree tree={mockDatabaseTree} onSelectArticle={onSelect} />);

    await userEvent.click(screen.getByText('Хуки React'));

    expect(onSelect).toHaveBeenCalledWith('react-hooks');
  });

  it('без дерева показывает скелетон (aria-busy)', () => {
    renderWithProviders(<KbTree tree={undefined} onSelectArticle={vi.fn()} />);
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-busy', 'true');
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(
      <KbTree tree={mockDatabaseTree} selectedSlug="react-hooks" onSelectArticle={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

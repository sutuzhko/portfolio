import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/app/test/render';

import { Highlights, type HighlightItem } from './ui/highlights';

const items: HighlightItem[] = [
  { value: '3+', label: 'года в коммерческой разработке' },
  { value: '3', label: 'UI-kit построил с нуля' },
  { value: 'C1', label: 'English — доки и issues без перевода' },
  { value: '3 kyu', label: 'Codewars · 62 ката решено' },
];

describe('Highlights', () => {
  it('рендерит все показатели значениями и подписями', () => {
    renderWithProviders(<Highlights items={items} />);
    expect(screen.getByText('3+')).toBeInTheDocument();
    expect(screen.getByText('3 kyu')).toBeInTheDocument();
    expect(screen.getByText('года в коммерческой разработке')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('показывает скелетон, пока показатели грузятся', () => {
    renderWithProviders(<Highlights isLoading />);
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('3+')).not.toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(<Highlights items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

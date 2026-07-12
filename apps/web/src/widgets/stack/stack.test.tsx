import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockTechnologies } from '@/entities/technology/mocks';

import { Stack } from './ui/stack';

describe('Stack', () => {
  it('рендерит локализованный заголовок секции', () => {
    renderWithProviders(<Stack technologies={mockTechnologies} />);
    expect(screen.getByRole('heading', { name: '// стек' })).toBeInTheDocument();
  });

  it('группирует технологии по категориям', () => {
    renderWithProviders(<Stack technologies={mockTechnologies} />);
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('Tooling')).toBeInTheDocument();
    expect(screen.getByText('NestJS')).toBeInTheDocument();
    expect(screen.getByText('Storybook')).toBeInTheDocument();
  });

  it('без данных показывает скелетон (нет групп)', () => {
    renderWithProviders(<Stack isLoading />);
    expect(screen.queryByText('Frontend')).not.toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(<Stack technologies={mockTechnologies} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

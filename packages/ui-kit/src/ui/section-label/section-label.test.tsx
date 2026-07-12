import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { SectionLabel } from './section-label';

describe('SectionLabel', () => {
  it('рендерит содержимое', () => {
    render(<SectionLabel>{'// стек'}</SectionLabel>);
    expect(screen.getByText('// стек')).toBeInTheDocument();
  });

  it('по умолчанию — заголовок секции (h2)', () => {
    render(<SectionLabel>{'// активность'}</SectionLabel>);
    expect(screen.getByRole('heading', { level: 2, name: '// активность' })).toBeInTheDocument();
  });

  it('позволяет сменить тег через as', () => {
    render(<SectionLabel as="span">{'// обо мне'}</SectionLabel>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('// обо мне')).toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = render(<SectionLabel>{'// избранные проекты'}</SectionLabel>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

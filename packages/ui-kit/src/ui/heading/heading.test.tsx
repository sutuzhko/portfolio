import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { Heading } from './heading';

describe('Heading', () => {
  it('по умолчанию рендерит h2', () => {
    render(<Heading>Раздел</Heading>);
    expect(screen.getByRole('heading', { level: 2, name: 'Раздел' })).toBeInTheDocument();
  });

  it('выбирает тег по визуальному уровню', () => {
    render(<Heading level="display">Герой</Heading>);
    expect(screen.getByRole('heading', { level: 1, name: 'Герой' })).toBeInTheDocument();
  });

  it('позволяет понизить семантику через as, не меняя размер', () => {
    render(
      <Heading level="display" as="h2">
        Крупно, но h2
      </Heading>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Крупно, но h2' })).toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = render(<Heading level="h1">Заголовок страницы</Heading>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

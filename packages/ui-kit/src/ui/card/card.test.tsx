import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { Card } from './card';

describe('Card', () => {
  it('рендерит содержимое', () => {
    render(<Card>Внутри</Card>);
    expect(screen.getByText('Внутри')).toBeInTheDocument();
  });

  it('пробрасывает атрибуты контейнеру', () => {
    render(<Card data-testid="c">x</Card>);
    expect(screen.getByTestId('c')).toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = render(<Card>Контент</Card>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

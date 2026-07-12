import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { Text } from './text';

describe('Text', () => {
  it('по умолчанию рендерит абзац', () => {
    render(<Text>Текст</Text>);
    expect(screen.getByText('Текст').tagName).toBe('P');
  });

  it('меняет тег через as, сохраняя содержимое', () => {
    render(<Text as="span">Инлайн</Text>);
    expect(screen.getByText('Инлайн').tagName).toBe('SPAN');
  });

  it('пробрасывает произвольные атрибуты', () => {
    render(<Text data-testid="t">x</Text>);
    expect(screen.getByTestId('t')).toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = render(<Text tone="muted">Приглушённый текст</Text>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

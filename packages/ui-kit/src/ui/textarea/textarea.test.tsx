import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { Textarea } from './textarea';

describe('Textarea', () => {
  it('связывает подпись с полем', () => {
    render(<Textarea label="Био" />);
    expect(screen.getByLabelText('Био')).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('при ошибке помечает поле невалидным', () => {
    render(<Textarea label="Био" error="обязательно" />);
    expect(screen.getByLabelText('Био')).toHaveAttribute('aria-invalid', 'true');
  });

  it('не нарушает доступность', async () => {
    const { container } = render(<Textarea label="Био" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

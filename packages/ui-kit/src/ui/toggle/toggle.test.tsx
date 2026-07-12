import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { Toggle } from './toggle';

describe('Toggle', () => {
  it('имеет роль switch и отражает состояние', () => {
    const { rerender } = render(<Toggle aria-label="Видимость" />);
    expect(screen.getByRole('switch', { name: 'Видимость' })).toHaveAttribute(
      'aria-checked',
      'false',
    );

    rerender(<Toggle aria-label="Видимость" checked />);
    expect(screen.getByRole('switch', { name: 'Видимость' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('сообщает новое значение через onCheckedChange', async () => {
    const onCheckedChange = vi.fn();
    render(<Toggle aria-label="Видимость" checked={false} onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByRole('switch'));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('не нарушает доступность', async () => {
    const { container } = render(<Toggle aria-label="Видимость" checked />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

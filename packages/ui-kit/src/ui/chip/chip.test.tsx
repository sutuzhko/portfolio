import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { Chip } from './chip';

describe('Chip', () => {
  it('отражает выбранность в aria-pressed', () => {
    const { rerender } = render(<Chip>React</Chip>);
    expect(screen.getByRole('button', { name: 'React' })).toHaveAttribute('aria-pressed', 'false');

    rerender(<Chip selected>React</Chip>);
    expect(screen.getByRole('button', { name: 'React' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('вызывает onClick при переключении', async () => {
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>Vue</Chip>);

    await userEvent.click(screen.getByRole('button', { name: 'Vue' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('не нарушает доступность в обоих состояниях', async () => {
    const { container } = render(
      <>
        <Chip>React</Chip>
        <Chip selected>Vue</Chip>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

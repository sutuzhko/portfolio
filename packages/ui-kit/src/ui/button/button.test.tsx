import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  it('по умолчанию имеет type=button (не сабмитит форму)', () => {
    render(<Button>Ок</Button>);
    expect(screen.getByRole('button', { name: 'Ок' })).toHaveAttribute('type', 'button');
  });

  it('вызывает onClick по клику', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Жми</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Жми' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('не вызывает onClick в disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Нельзя
      </Button>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Нельзя' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('icon-вариант доступен по aria-label', async () => {
    const { container } = render(
      <Button variant="icon" aria-label="Закрыть">
        ×
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Закрыть' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

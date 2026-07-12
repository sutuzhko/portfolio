import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { ErrorState } from './error-state';

describe('ErrorState', () => {
  it('показывает сообщение и зовёт onRetry по клику', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Ошибка загрузки" retryLabel="Повторить" onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Ошибка загрузки');
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('без onRetry не рендерит кнопку', () => {
    render(<ErrorState message="Ошибка" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = render(
      <ErrorState message="Ошибка" retryLabel="Повторить" onRetry={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

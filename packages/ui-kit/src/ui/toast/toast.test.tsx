import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { Toast } from './toast';

describe('Toast', () => {
  it('информационный тост анонсируется как status', () => {
    render(<Toast type="info" title="Привет" />);
    expect(screen.getByRole('status')).toHaveTextContent('Привет');
  });

  it('ошибка анонсируется как alert', () => {
    render(<Toast type="error" title="Сбой" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Сбой');
  });

  it('вызывает onClose по кнопке закрытия', async () => {
    const onClose = vi.fn();
    render(<Toast title="Привет" onClose={onClose} closeLabel="Закрыть" />);

    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('не нарушает доступность', async () => {
    const { container } = render(
      <Toast
        type="success"
        title="Готово"
        description="Сохранено"
        onClose={vi.fn()}
        closeLabel="Закрыть"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

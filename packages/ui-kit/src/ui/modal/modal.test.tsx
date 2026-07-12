import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from './modal';

function setup(props: Partial<Parameters<typeof Modal>[0]> = {}) {
  return render(
    <Modal open onClose={vi.fn()} title="Тест" closeLabel="Закрыть" {...props}>
      <p>Тело окна</p>
    </Modal>,
  );
}

describe('Modal', () => {
  it('рендерит диалог с заголовком и телом', () => {
    setup();
    expect(screen.getByRole('dialog', { name: 'Тест' })).toBeInTheDocument();
    expect(screen.getByText('Тело окна')).toBeInTheDocument();
  });

  it('закрытое окно ничего не рендерит', () => {
    setup({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Escape закрывает окно', async () => {
    const onClose = vi.fn();
    setup({ onClose });
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('клик по фону закрывает окно', async () => {
    const onClose = vi.fn();
    setup({ onClose });
    // Первая кнопка «Закрыть» — фон (лежит под панелью), вторая — крестик.
    await userEvent.click(screen.getAllByRole('button', { name: 'Закрыть' })[0]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('не нарушает доступность', async () => {
    const { baseElement } = setup({ footer: <button type="button">ОК</button> });
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});

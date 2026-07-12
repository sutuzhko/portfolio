import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from './confirm-dialog';

function setup(props: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmDialog
      open
      title="Удалить?"
      message="Действие необратимо."
      confirmLabel="Удалить"
      cancelLabel="Отмена"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
  it('рендерит заголовок, пояснение и кнопки', () => {
    setup();
    expect(screen.getByRole('dialog', { name: 'Удалить?' })).toBeInTheDocument();
    expect(screen.getByText('Действие необратимо.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Удалить' })).toBeInTheDocument();
  });

  it('закрытый диалог ничего не рендерит', () => {
    setup({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('кнопка подтверждения вызывает onConfirm', async () => {
    const { onConfirm } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Удалить' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('кнопка отмены вызывает onCancel', async () => {
    const { onCancel } = setup();
    // Крестик и фон помечены aria-label; кнопку футера берём по видимому тексту.
    await userEvent.click(screen.getByText('Отмена'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('в состоянии busy кнопки заблокированы', () => {
    setup({ busy: true });
    expect(screen.getByRole('button', { name: 'Удалить' })).toBeDisabled();
  });

  it('не нарушает доступность', async () => {
    const { baseElement } = render(
      <ConfirmDialog
        open
        title="Удалить?"
        message="Действие необратимо."
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});

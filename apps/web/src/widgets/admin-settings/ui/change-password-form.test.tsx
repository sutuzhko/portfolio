import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';

import { ChangePasswordForm } from './change-password-form';

describe('ChangePasswordForm', () => {
  it('шлёт текущий и новый пароль при совпадении подтверждения', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<ChangePasswordForm isSaving={false} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Текущий пароль'), 'admin12345');
    await userEvent.type(screen.getByLabelText('Новый пароль'), 'newsecret123');
    await userEvent.type(screen.getByLabelText('Повторите новый пароль'), 'newsecret123');
    await userEvent.click(screen.getByRole('button', { name: 'Сменить пароль' }));

    expect(onSubmit).toHaveBeenCalledWith({
      currentPassword: 'admin12345',
      newPassword: 'newsecret123',
    });
  });

  it('не отправляет при несовпадении паролей', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<ChangePasswordForm isSaving={false} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Текущий пароль'), 'admin12345');
    await userEvent.type(screen.getByLabelText('Новый пароль'), 'newsecret123');
    await userEvent.type(screen.getByLabelText('Повторите новый пароль'), 'different999');
    await userEvent.click(screen.getByRole('button', { name: 'Сменить пароль' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument();
  });

  it('не отправляет слишком короткий новый пароль', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<ChangePasswordForm isSaving={false} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Текущий пароль'), 'admin12345');
    await userEvent.type(screen.getByLabelText('Новый пароль'), 'short');
    await userEvent.type(screen.getByLabelText('Повторите новый пароль'), 'short');
    await userEvent.click(screen.getByRole('button', { name: 'Сменить пароль' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Минимум 8 символов')).toBeInTheDocument();
  });
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';

import { LoginPageView } from './login-page-view';

describe('LoginPageView', () => {
  it('рендерит форму входа', () => {
    renderWithProviders(<LoginPageView onSubmit={vi.fn()} isSubmitting={false} invalid={false} />);

    expect(screen.getByLabelText('логин')).toBeInTheDocument();
    expect(screen.getByLabelText('пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
  });

  it('не отправляет пустую форму — показывает ошибки валидации', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<LoginPageView onSubmit={onSubmit} isSubmitting={false} invalid={false} />);

    await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByText('Введите логин')).toBeInTheDocument();
    expect(screen.getByText('Введите пароль')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('отправляет валидные данные', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<LoginPageView onSubmit={onSubmit} isSubmitting={false} invalid={false} />);

    await userEvent.type(screen.getByLabelText('логин'), 'admin');
    await userEvent.type(screen.getByLabelText('пароль'), 'admin12345');
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

    // React Hook Form вызывает onSubmit как (data, event) — сверяем первый аргумент.
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ username: 'admin', password: 'admin12345' });
  });

  it('показывает ошибку сервера при invalid', () => {
    renderWithProviders(<LoginPageView onSubmit={vi.fn()} isSubmitting={false} invalid />);
    expect(screen.getByRole('alert')).toHaveTextContent('Неверный логин или пароль');
  });

  it('показывает Telegram-ник владельца ссылкой (данные с бэкенда)', () => {
    renderWithProviders(
      <LoginPageView
        onSubmit={vi.fn()}
        isSubmitting={false}
        invalid={false}
        telegram={{ url: 'https://t.me/sutuzhko', handle: '@sutuzhko' }}
      />,
    );

    const link = screen.getByRole('link', { name: '@sutuzhko' });
    expect(link).toHaveAttribute('href', 'https://t.me/sutuzhko');
  });

  it('блокирует кнопку во время отправки', () => {
    renderWithProviders(<LoginPageView onSubmit={vi.fn()} isSubmitting invalid={false} />);
    expect(screen.getByRole('button', { name: 'Войти' })).toBeDisabled();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(
      <LoginPageView
        onSubmit={vi.fn()}
        isSubmitting={false}
        invalid={false}
        telegram={{ url: 'https://t.me/sutuzhko', handle: '@sutuzhko' }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

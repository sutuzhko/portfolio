import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { sessionApi } from '@/entities/session';
import { makeStore } from '@/shared/store';

import { ProfileMenuTrigger } from './profile-menu-trigger';

describe('ProfileMenuTrigger', () => {
  it('гость видит обобщённую иконку (без аватара)', async () => {
    const { container } = renderWithProviders(<ProfileMenuTrigger />);
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
  });

  it('залогиненный видит аватар профиля (инициалы имени)', async () => {
    // Открываем сессию в моке (модульная переменная общая на прогон).
    const store = makeStore();
    await store
      .dispatch(sessionApi.endpoints.login.initiate({ username: 'admin', password: 'admin12345' }))
      .unwrap();

    renderWithProviders(<ProfileMenuTrigger />);

    // Аватар декоративен (в aria-hidden), поэтому ищем скрытые элементы.
    const avatar = await screen.findByRole('img', { name: 'Богдан Сутужко', hidden: true });
    expect(avatar).toHaveTextContent('БС');
  });
});

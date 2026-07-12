import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { sessionApi } from '@/entities/session';
import { makeStore } from '@/shared/store';

import { RequireAuth } from './require-auth';

function renderGuardedAt(path: string) {
  return renderWithProviders(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/private" element={<div>Секретная страница</div>} />
        </Route>
        <Route path="/login" element={<div>Экран входа</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAuth', () => {
  it('гостя уводит на /login', async () => {
    renderGuardedAt('/private');
    expect(await screen.findByText('Экран входа')).toBeInTheDocument();
    expect(screen.queryByText('Секретная страница')).not.toBeInTheDocument();
  });

  it('авторизованного пропускает к приватной странице', async () => {
    // Открываем сессию в моке (модульная переменная общая на прогон).
    const store = makeStore();
    await store
      .dispatch(sessionApi.endpoints.login.initiate({ username: 'admin', password: 'admin12345' }))
      .unwrap();

    renderGuardedAt('/private');

    await waitFor(() => {
      expect(screen.getByText('Секретная страница')).toBeInTheDocument();
    });
  });
});

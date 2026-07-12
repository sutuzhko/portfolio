import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { settingsApi } from '@/entities/settings';
import { makeStore } from '@/shared/store';

import { PageGate } from './page-gate';

function renderGatedProjects() {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/projects']}>
      <Routes>
        <Route element={<PageGate page="projects" />}>
          <Route path="/projects" element={<div>Страница проектов</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('PageGate', () => {
  it('рендерит страницу, когда она включена в настройках', async () => {
    renderGatedProjects();
    expect(await screen.findByText('Страница проектов')).toBeInTheDocument();
  });

  it('отдаёт 404, когда страница выключена в настройках', async () => {
    // Выключаем страницу в моке настроек (модульное состояние общее на прогон).
    const store = makeStore();
    await store
      .dispatch(settingsApi.endpoints.updateSettings.initiate({ showProjects: false }))
      .unwrap();

    renderGatedProjects();

    await waitFor(() => {
      expect(screen.queryByText('Страница проектов')).not.toBeInTheDocument();
    });
  });
});

import { screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { settingsApi } from '@/entities/settings';
import { makeStore } from '@/shared/store';

import { LangSwitch } from './lang-switch';

describe('LangSwitch', () => {
  it('рендерит кнопку с кодом локали и доступной подписью', () => {
    renderWithProviders(<LangSwitch />);
    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName();
    expect(button.textContent).toMatch(/^(RU|EN)$/);
  });

  it('скрывает переключатель, когда на сайте доступен один язык', async () => {
    const store = makeStore();
    await store
      .dispatch(settingsApi.endpoints.updateSettings.initiate({ availableLanguages: ['ru'] }))
      .unwrap();

    renderWithProviders(<LangSwitch />);

    await waitFor(() => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(<LangSwitch />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

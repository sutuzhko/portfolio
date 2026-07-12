import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockSettings } from '@/entities/settings/mocks';

import { AdminSettingsView } from './admin-settings-view';

function renderView(overrides: Partial<Parameters<typeof AdminSettingsView>[0]> = {}) {
  return renderWithProviders(
    <AdminSettingsView settings={mockSettings} isSaving={false} onSave={vi.fn()} {...overrides} />,
  );
}

describe('AdminSettingsView', () => {
  it('рендерит поля сайта, сегменты и тумблеры', () => {
    renderView();
    expect(screen.getByLabelText('Логотип', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Тема по умолчанию' })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Язык по умолчанию' })).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'Свечение за курсором в консоли' }),
    ).toBeInTheDocument();
  });

  it('смена темы и сохранение вызывает onSave', async () => {
    const onSave = vi.fn();
    renderView({ onSave });

    await userEvent.click(screen.getByRole('radio', { name: 'Light' }));
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
    expect(onSave.mock.calls[0]?.[0]).toMatchObject({ defaultTheme: 'light' });
  });

  it('переключение тумблера уходит в onSave', async () => {
    const onSave = vi.fn();
    renderView({ onSave });

    await userEvent.click(screen.getByRole('switch', { name: 'Активность' }));
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
    expect(onSave.mock.calls[0]?.[0]).toMatchObject({ showActivity: false });
  });

  it('тумблер видимости секции («Избранное») уходит в onSave', async () => {
    const onSave = vi.fn();
    renderView({ onSave });

    await userEvent.click(screen.getByRole('switch', { name: 'Избранное' }));
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
    expect(onSave.mock.calls[0]?.[0]).toMatchObject({ showFeatured: false });
  });

  it('тумблер видимости страницы («Проекты») уходит в onSave', async () => {
    const onSave = vi.fn();
    renderView({ onSave });

    await userEvent.click(screen.getByRole('switch', { name: 'Проекты' }));
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
    expect(onSave.mock.calls[0]?.[0]).toMatchObject({ showProjects: false });
  });

  it('выбор акцента оформления уходит в onSave', async () => {
    const onSave = vi.fn();
    renderView({ onSave });

    await userEvent.click(screen.getByRole('radio', { name: 'Синий' }));
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
    expect(onSave.mock.calls[0]?.[0]).toMatchObject({ accentColor: 'blue' });
  });

  it('выключение языка сайта уходит в onSave (перевод не удаляется)', async () => {
    const onSave = vi.fn();
    renderView({ onSave });

    await userEvent.click(screen.getByRole('switch', { name: 'English' }));
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
    expect(onSave.mock.calls[0]?.[0]).toMatchObject({ availableLanguages: ['ru'] });
  });

  it('пустой логотип блокирует сохранение', async () => {
    const onSave = vi.fn();
    renderView({ onSave });

    await userEvent.clear(screen.getByLabelText('Логотип', { exact: false }));
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    await waitFor(() => {
      expect(screen.getByText('Обязательное поле')).toBeInTheDocument();
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderView();
    expect(await axe(container)).toHaveNoViolations();
  });
});

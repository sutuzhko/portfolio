import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';

import { AdminPageView } from './admin-page-view';

const tabs = [
  { id: 'profile', label: 'Профиль' },
  { id: 'projects', label: 'Проекты' },
];

describe('AdminPageView', () => {
  it('рендерит заголовок, вкладки и панель с контентом', () => {
    renderWithProviders(
      <AdminPageView
        tabs={tabs}
        activeTab="profile"
        activeLabel="Профиль"
        onTabChange={vi.fn()}
        onBack={vi.fn()}
      >
        <div>Контент вкладки</div>
      </AdminPageView>,
    );

    expect(screen.getByRole('heading', { name: 'Личный кабинет' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Профиль' })).toBeInTheDocument();
    expect(screen.getByRole('tabpanel', { name: 'Профиль' })).toHaveTextContent('Контент вкладки');
  });

  it('переключение вкладки вызывает onTabChange', async () => {
    const onTabChange = vi.fn();
    renderWithProviders(
      <AdminPageView
        tabs={tabs}
        activeTab="profile"
        activeLabel="Профиль"
        onTabChange={onTabChange}
        onBack={vi.fn()}
      >
        <div />
      </AdminPageView>,
    );

    await userEvent.click(screen.getByRole('tab', { name: 'Проекты' }));
    expect(onTabChange).toHaveBeenCalledWith('projects');
  });

  it('кнопка «назад» вызывает onBack', async () => {
    const onBack = vi.fn();
    renderWithProviders(
      <AdminPageView
        tabs={tabs}
        activeTab="profile"
        activeLabel="Профиль"
        onTabChange={vi.fn()}
        onBack={onBack}
      >
        <div />
      </AdminPageView>,
    );

    await userEvent.click(screen.getByRole('button', { name: /cd ~/ }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});

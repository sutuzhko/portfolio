import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockExperienceAdmin } from '@/entities/experience/mocks';

import { AdminExperienceView } from './admin-experience-view';

function renderView(overrides: Partial<Parameters<typeof AdminExperienceView>[0]> = {}) {
  return renderWithProviders(
    <AdminExperienceView
      items={mockExperienceAdmin}
      locale="ru"
      isBusy={false}
      onAdd={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      {...overrides}
    />,
  );
}

describe('AdminExperienceView', () => {
  it('рендерит список с компанией, ролью и «сейчас»', () => {
    renderView();
    expect(screen.getByText('Go Mobile')).toBeInTheDocument();
    expect(screen.getByText('Frontend-разработчик')).toBeInTheDocument();
    expect(screen.getByText('сейчас')).toBeInTheDocument();
  });

  it('«Добавить» вызывает onAdd', async () => {
    const onAdd = vi.fn();
    renderView({ onAdd });
    await userEvent.click(screen.getByRole('button', { name: 'Добавить' }));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('редактирование ведёт на элемент по id', async () => {
    const onEdit = vi.fn();
    renderView({ onEdit });
    await userEvent.click(screen.getAllByRole('button', { name: 'Редактировать' })[0]);
    expect(onEdit).toHaveBeenCalledWith('go-mobile');
  });

  it('удаление требует подтверждения', async () => {
    const onDelete = vi.fn();
    renderView({ onDelete });
    await userEvent.click(screen.getAllByRole('button', { name: 'Удалить' })[0]);
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Удалить' }),
    );
    expect(onDelete).toHaveBeenCalledWith('go-mobile');
  });

  it('не нарушает доступность', async () => {
    const { container } = renderView();
    expect(await axe(container)).toHaveNoViolations();
  });
});

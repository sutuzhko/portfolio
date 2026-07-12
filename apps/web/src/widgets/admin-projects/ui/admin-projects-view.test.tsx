import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockContributorsAdmin } from '@/entities/contributor/mocks';
import { mockProjectsAdmin } from '@/entities/project/mocks';
import { mockTechnologiesAdmin } from '@/entities/technology/mocks';

import { AdminProjectsView } from './admin-projects-view';

function renderView(overrides: Partial<Parameters<typeof AdminProjectsView>[0]> = {}) {
  return renderWithProviders(
    <AdminProjectsView
      items={mockProjectsAdmin}
      technologies={mockTechnologiesAdmin}
      contributors={mockContributorsAdmin}
      locale="ru"
      isBusy={false}
      onAdd={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      {...overrides}
    />,
  );
}

describe('AdminProjectsView', () => {
  it('рендерит список проектов с названием и статусом', () => {
    renderView();
    expect(screen.getByText('Procharity')).toBeInTheDocument();
    expect(screen.getByText('Игра: 2048')).toBeInTheDocument();
    expect(screen.getAllByText(/Опубликован/).length).toBeGreaterThan(0);
  });

  it('показывает участников проекта в строке', () => {
    renderView();
    expect(screen.getByText(/Богдан Сутужко, Алексей Мартынов/)).toBeInTheDocument();
  });

  it('«Новый проект» вызывает onAdd', async () => {
    const onAdd = vi.fn();
    renderView({ onAdd });
    await userEvent.click(screen.getByRole('button', { name: 'Новый проект' }));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('редактирование ведёт на проект по id', async () => {
    const onEdit = vi.fn();
    renderView({ onEdit });
    await userEvent.click(screen.getAllByRole('button', { name: 'Редактировать' })[0]);
    expect(onEdit).toHaveBeenCalledWith('p-procharity');
  });

  it('удаление требует подтверждения', async () => {
    const onDelete = vi.fn();
    renderView({ onDelete });
    await userEvent.click(screen.getAllByRole('button', { name: 'Удалить' })[0]);
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Удалить' }),
    );
    expect(onDelete).toHaveBeenCalledWith('p-procharity');
  });

  it('не нарушает доступность', async () => {
    const { container } = renderView();
    expect(await axe(container)).toHaveNoViolations();
  });
});

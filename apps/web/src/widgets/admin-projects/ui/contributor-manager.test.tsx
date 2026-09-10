import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { mockContributorsAdmin } from '@/entities/contributor/mocks';
import { renderWithProviders } from '@/app/test/render';

import { initStaged, visibleStaged } from '../model/contributor-staging';

import { ContributorManager } from './contributor-manager';

const staged = visibleStaged(initStaged(mockContributorsAdmin));

function renderManager(overrides: Partial<ComponentProps<typeof ContributorManager>> = {}) {
  const props = {
    locale: 'ru' as const,
    disabled: false,
    staged,
    selectedIds: [],
    onToggle: vi.fn(),
    onStageCreate: vi.fn(),
    onStageUpdate: vi.fn(),
    onStageDelete: vi.fn(),
    onReorder: vi.fn(),
    ...overrides,
  };
  renderWithProviders(<ContributorManager {...props} />);
  return props;
}

describe('ContributorManager', () => {
  it('тоггл чипа выбирает участника', async () => {
    const onToggle = vi.fn();
    renderManager({ onToggle });

    await userEvent.click(screen.getByRole('button', { name: 'Богдан Сутужко' }));
    expect(onToggle).toHaveBeenCalledWith('bogdan');
  });

  it('у каждого участника есть ручка перетаскивания для смены порядка', () => {
    renderManager();
    expect(
      screen.getByRole('button', { name: 'Переместить «Богдан Сутужко»' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Переместить «/ })).toHaveLength(staged.length);
  });

  it('чипы идут в порядке каталога', () => {
    renderManager();
    const toggles = screen.getAllByRole('button', { pressed: false });
    expect(toggles.map((button) => button.textContent)).toEqual(
      staged.map((contributor) => contributor.name.ru),
    );
  });

  it('создание стейджится (без немедленного запроса)', async () => {
    const onStageCreate = vi.fn();
    renderManager({ onStageCreate });

    await userEvent.click(screen.getByRole('button', { name: '+ создать участника' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Имя' }), 'Пётр');
    await userEvent.click(screen.getByRole('button', { name: 'Добавить' }));

    expect(onStageCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Пётр' }));
  });

  it('правка через карандаш стейджит новое имя', async () => {
    const onStageUpdate = vi.fn();
    renderManager({ onStageUpdate });

    await userEvent.click(screen.getByRole('button', { name: 'Редактировать «Богдан Сутужко»' }));
    const nameField = screen.getByRole('textbox', { name: 'Имя' });
    expect(nameField).toHaveValue('Богдан Сутужко');
    await userEvent.clear(nameField);
    await userEvent.type(nameField, 'Богдан С.');
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onStageUpdate).toHaveBeenCalledWith(
      'bogdan',
      expect.objectContaining({ name: 'Богдан С.' }),
    );
  });

  it('удаление требует подтверждения и стейджит', async () => {
    const onStageDelete = vi.fn();
    renderManager({ onStageDelete });

    await userEvent.click(screen.getByRole('button', { name: 'Редактировать «Богдан Сутужко»' }));
    await userEvent.click(screen.getByRole('button', { name: 'Удалить' }));

    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Удалить' }));

    expect(onStageDelete).toHaveBeenCalledWith('bogdan');
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(
      <ContributorManager
        locale="ru"
        disabled={false}
        staged={staged}
        selectedIds={['bogdan']}
        onToggle={vi.fn()}
        onStageCreate={vi.fn()}
        onStageUpdate={vi.fn()}
        onStageDelete={vi.fn()}
        onReorder={vi.fn()}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

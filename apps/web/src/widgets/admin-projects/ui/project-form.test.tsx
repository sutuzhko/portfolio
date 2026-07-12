import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockContributorsAdmin } from '@/entities/contributor/mocks';
import type { CreateProject } from '@/entities/project';
import { mockProjectsAdmin } from '@/entities/project/mocks';
import { mockTechnologiesAdmin } from '@/entities/technology/mocks';

import { isTempContributorId, type StagedContributor } from '../model/contributor-staging';

import { ProjectForm } from './project-form';

function renderForm(overrides: Partial<Parameters<typeof ProjectForm>[0]> = {}) {
  return renderWithProviders(
    <ProjectForm
      record={null}
      technologies={mockTechnologiesAdmin}
      contributors={mockContributorsAdmin}
      locale="ru"
      isBusy={false}
      onCreate={vi.fn()}
      onUpdate={vi.fn()}
      onUploadGallery={vi.fn()}
      onDeleteGallery={vi.fn()}
      onCopyGalleryUrl={vi.fn()}
      onCancel={vi.fn()}
      {...overrides}
    />,
  );
}

async function fillRequired(): Promise<void> {
  await userEvent.type(screen.getByLabelText('Название', { exact: false }), 'Мой проект');
  await userEvent.type(screen.getByLabelText('Slug (URL)', { exact: false }), 'my-project');
  await userEvent.type(screen.getByLabelText('Краткое описание', { exact: false }), 'Кратко');
  await userEvent.type(screen.getByLabelText('Полное описание', { exact: false }), 'Тело');
}

describe('ProjectForm', () => {
  it('создание отправляет тело с базовой локалью и связями', async () => {
    const onCreate = vi.fn();
    renderForm({ onCreate });
    await fillRequired();
    await userEvent.click(screen.getByRole('button', { name: 'React' }));
    await userEvent.click(screen.getByRole('button', { name: 'Богдан Сутужко' }));
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate.mock.calls[0]?.[0]).toMatchObject({
      slug: 'my-project',
      title: { ru: 'Мой проект' },
      description: { ru: 'Кратко' },
      bodyMarkdown: { ru: 'Тело' },
      technologyIds: ['0'],
      contributorIds: ['bogdan'],
      status: 'DRAFT',
    });
  });

  it('создание участника стейджится и уходит вместе с проектом', async () => {
    const onCreate = vi.fn<(body: CreateProject, staged: readonly StagedContributor[]) => void>();
    renderForm({ onCreate });
    await fillRequired();
    await userEvent.click(screen.getByRole('button', { name: 'React' }));

    // Инлайн-создание участника — до «Сохранить» никакого запроса нет.
    await userEvent.click(screen.getByRole('button', { name: '+ создать участника' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Имя' }), 'Пётр');
    await userEvent.click(screen.getByRole('button', { name: 'Добавить' }));

    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    // Новый участник уходит во втором аргументе (черновик) и выбран в проекте
    // по временному id — реальный проставит контейнер после применения.
    const [body, staged] = onCreate.mock.calls[0] ?? [undefined, []];
    expect(staged.some((entry) => entry.isNew && entry.name.ru === 'Пётр')).toBe(true);
    expect(body?.contributorIds?.some(isTempContributorId)).toBe(true);
  });

  it('валидация: без технологий не сохраняет', async () => {
    const onCreate = vi.fn();
    renderForm({ onCreate });
    await fillRequired();
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));
    expect(await screen.findByText('Выберите хотя бы одну технологию')).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('редактирование существующего проекта шлёт патч активной локали', async () => {
    const onUpdate = vi.fn();
    renderForm({ record: mockProjectsAdmin[0] ?? null, onUpdate });
    const title = screen.getByDisplayValue('Procharity');
    await userEvent.clear(title);
    await userEvent.type(title, 'Procharity 2');
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0]?.[0]).toBe('p-procharity');
    expect(onUpdate.mock.calls[0]?.[1]).toMatchObject({
      title: { ru: 'Procharity 2' },
      slug: 'procharity',
    });
  });

  it('«Отмена» вызывает onCancel', async () => {
    const onCancel = vi.fn();
    renderForm({ onCancel });
    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderForm();
    expect(await axe(container)).toHaveNoViolations();
  });
});

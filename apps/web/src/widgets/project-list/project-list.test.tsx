import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import type { ProjectListItem } from '@/entities/project';
import { renderWithProviders } from '@/app/test/render';

import { ProjectList } from './ui/project-list';

function makeProject(overrides: Partial<ProjectListItem> = {}): ProjectListItem {
  return {
    slug: 'project',
    title: 'Project',
    description: 'Description',
    subtitle: null,
    category: null,
    period: null,
    tileColor: null,
    pinned: false,
    runnable: false,
    runCommand: null,
    embedUrl: null,
    primaryLanguage: null,
    technologies: [],
    contributors: [],
    ...overrides,
  };
}

const projects = [
  makeProject({ slug: 'alpha', title: 'Alpha' }),
  makeProject({ slug: 'beta', title: 'Beta' }),
];

describe('ProjectList', () => {
  it('рендерит по карточке на каждый проект', () => {
    renderWithProviders(
      <ProjectList projects={projects} onOpen={vi.fn()} onClearFilters={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: /Alpha/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Beta/ })).toBeInTheDocument();
  });

  it('при загрузке показывает скелетоны, а не карточки', () => {
    const { container } = renderWithProviders(
      <ProjectList projects={[]} isLoading onOpen={vi.fn()} onClearFilters={vi.fn()} />,
    );
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('при нуле результатов показывает пустое состояние и сбрасывает фильтры', async () => {
    const onClearFilters = vi.fn();
    renderWithProviders(
      <ProjectList projects={[]} onOpen={vi.fn()} onClearFilters={onClearFilters} />,
    );
    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Сбросить фильтры' }));
    expect(onClearFilters).toHaveBeenCalledOnce();
  });

  it('по клику на карточку зовёт onOpen со slug проекта', async () => {
    const onOpen = vi.fn();
    renderWithProviders(
      <ProjectList projects={projects} onOpen={onOpen} onClearFilters={vi.fn()} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Alpha/ }));
    expect(onOpen).toHaveBeenCalledWith('alpha');
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(
      <ProjectList projects={projects} onOpen={vi.fn()} onClearFilters={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

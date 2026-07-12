import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { ProjectListItem } from '@/entities/project';
import { renderWithProviders } from '@/app/test/render';

import { useProjectFilter } from './model/use-project-filter';
import { ProjectFilterBar } from './ui/project-filter-bar';

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
  makeProject({ slug: 'alpha', title: 'Alpha', technologies: ['React'], contributors: [] }),
  makeProject({ slug: 'beta', title: 'Beta', technologies: ['Vue'], contributors: [] }),
];

// Обёртка связывает панель с контроллером и показывает число результатов —
// так проверяем интеграцию UI + логики фильтра.
function Harness() {
  const filter = useProjectFilter(projects);
  return (
    <>
      <ProjectFilterBar filter={filter} />
      <output data-testid="count">{filter.filtered.length}</output>
    </>
  );
}

describe('ProjectFilterBar', () => {
  it('фильтрует по поисковому запросу', async () => {
    renderWithProviders(<Harness />);
    expect(screen.getByTestId('count')).toHaveTextContent('2');

    await userEvent.type(screen.getByRole('searchbox'), 'alpha');
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('переключает чип технологии и сужает список', async () => {
    renderWithProviders(<Harness />);

    const vueChip = screen.getByRole('button', { name: 'Vue' });
    expect(vueChip).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(vueChip);
    expect(vueChip).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('кнопка сброса появляется при активном фильтре и очищает его', async () => {
    renderWithProviders(<Harness />);
    expect(screen.queryByRole('button', { name: 'сбросить' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'React' }));
    await userEvent.click(screen.getByRole('button', { name: 'сбросить' }));

    expect(screen.getByRole('button', { name: 'React' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });
});

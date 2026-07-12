import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { ProjectListItem } from '@/entities/project';

import { useProjectFilter, type ProjectFilter } from './model/use-project-filter';
import { ProjectFilterBar } from './ui/project-filter-bar';

function makeProject(overrides: Partial<ProjectListItem>): ProjectListItem {
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

const projects: ProjectListItem[] = [
  makeProject({
    slug: 'procharity',
    title: 'Procharity',
    technologies: ['TypeScript', 'React', 'SCSS'],
    contributors: [{ name: 'Богдан', image: null, color: '#238636' }],
  }),
  makeProject({
    slug: 'deep-focus',
    title: 'Deep Focus',
    technologies: ['Vue', 'Node'],
    contributors: [{ name: 'Гвозденков', image: null, color: '#db6d28' }],
  }),
];

// Панель управляемая — связываем её с контроллером `useProjectFilter` в обёртке.
function FilterHarness() {
  const filter = useProjectFilter(projects);
  return <ProjectFilterBar filter={filter} />;
}

// Скелетон фасетов: опций ещё нет (проекты грузятся), панель в режиме isLoading.
function LoadingHarness() {
  const filter = useProjectFilter([]);
  return <ProjectFilterBar filter={filter} isLoading />;
}

// Обязательный проп `filter` для типа истории; реальный (живой) контроллер даёт
// `render` через `FilterHarness`, поэтому это значение не используется.
const staticFilter: ProjectFilter = {
  state: { query: '', techs: [], contributors: [] },
  filtered: projects,
  techOptions: [],
  contributorOptions: [],
  hasFilters: false,
  setQuery: () => undefined,
  toggleTech: () => undefined,
  toggleContributor: () => undefined,
  clear: () => undefined,
};

const meta = {
  title: 'Features/ProjectFilter',
  component: ProjectFilterBar,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: { filter: staticFilter },
  decorators: [(Story) => <div style={{ maxWidth: 720 }}>{Story()}</div>],
  render: () => <FilterHarness />,
} satisfies Meta<typeof ProjectFilterBar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница: строка поиска + фасеты технологий/контрибьюторов. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('searchbox')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'React' })).toBeInTheDocument();
  },
};

/** Пока проекты грузятся — фасеты показывают скелетон-чипы. */
export const Loading: Story = {
  name: 'Загрузка (скелетон)',
  render: () => <LoadingHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Опций-чипов ещё нет — только поиск и плейсхолдеры.
    await expect(canvas.queryByRole('button', { name: 'React' })).not.toBeInTheDocument();
  },
};

/** Живая фильтрация: ввод в поиск и переключение фасета (появляется сброс). */
export const Filtering: Story = {
  name: 'Живая фильтрация',
  render: () => <FilterHarness />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('searchbox');
    await userEvent.type(search, 'focus');
    await expect(search).toHaveValue('focus');

    const chip = canvas.getByRole('button', { name: 'React' });
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  },
};

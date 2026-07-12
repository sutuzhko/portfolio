import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import type { ProjectListItem } from '@/entities/project';

import { ProjectList } from './ui/project-list';

const projects: ProjectListItem[] = [
  {
    slug: 'procharity',
    title: 'Procharity',
    description: 'Платформа интеллектуального волонтёрства, соединяющая НКО и профессионалов.',
    subtitle: null,
    category: 'commercial',
    period: '2021',
    tileColor: 'linear-gradient(135deg, #1d6f74, #0f3d40)',
    pinned: true,
    runnable: false,
    runCommand: null,
    embedUrl: null,
    primaryLanguage: 'TypeScript',
    technologies: ['TypeScript', 'React', 'SCSS', 'Redux', 'Webpack'],
    contributors: [
      { name: 'Богдан', image: null, color: '#238636', link: null },
      { name: 'Алексей', image: null, color: '#8957e5', link: null },
      { name: 'Мария', image: null, color: '#1f6feb', link: null },
      { name: 'Иван', image: null, color: '#a371f7', link: null },
    ],
  },
  {
    slug: '2048',
    title: '2048',
    description: 'Классическая игра 2048 — запускается прямо в консоли портфолио.',
    subtitle: null,
    category: 'side-project',
    period: '2022',
    tileColor: 'linear-gradient(135deg, #7d4bd1, #3a1d66)',
    pinned: false,
    runnable: true,
    runCommand: '2048',
    embedUrl: 'https://sutuzhko.github.io/2048/',
    primaryLanguage: 'TypeScript',
    technologies: ['React', 'TypeScript'],
    contributors: [{ name: 'Богдан', image: null, color: '#238636', link: null }],
  },
  {
    slug: 'deep-focus',
    title: 'Deep Focus',
    description: 'Pomodoro-трекер продуктивности вместе с @gvozdenkov.',
    subtitle: null,
    category: 'side-project',
    period: '2023',
    tileColor: 'linear-gradient(135deg, #b0532a, #5c2a12)',
    pinned: true,
    runnable: false,
    runCommand: null,
    embedUrl: null,
    primaryLanguage: 'TypeScript',
    technologies: ['React', 'TypeScript', 'Node'],
    contributors: [
      { name: 'Богдан', image: null, color: '#238636', link: null },
      { name: 'Гвозденков', image: null, color: '#db6d28', link: null },
    ],
  },
];

const meta = {
  title: 'Widgets/ProjectList',
  component: ProjectList,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: { projects, onOpen: fn(), onClearFilters: fn() },
  argTypes: {
    projects: { control: 'object', table: { category: 'Контент' } },
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    onOpen: { control: false, table: { disable: true } },
    onClearFilters: { control: false, table: { disable: true } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-page)' }}>{Story()}</div>],
} satisfies Meta<typeof ProjectList>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Сетка карточек. play: клик по карточке открывает её деталь. */
export const Playground: Story = {
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /Deep Focus/ })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /Procharity/ }));
    await expect(args.onOpen).toHaveBeenCalledWith('procharity');
  },
};

/** Список грузится — сетка скелетон-карточек той же раскладки. */
export const Loading: Story = {
  name: 'Скелетоны загрузки',
  args: { projects: [], isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Ничего не найдено')).not.toBeInTheDocument();
  },
};

/** Пусто: приглашение сбросить фильтры. play: клик вызывает onClearFilters. */
export const Empty: Story = {
  name: 'Нет результатов',
  args: { projects: [] },
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Ничего не найдено')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClearFilters).toHaveBeenCalled();
  },
};

/** Мобильная раскладка: сетка в один столбец. */
export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

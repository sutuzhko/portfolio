import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import type { ProjectListItem } from '@/entities/project';

import { Featured } from './ui/featured';

const projects: ProjectListItem[] = [
  {
    slug: 'procharity',
    title: 'Procharity',
    description: 'Платформа интеллектуального волонтёрства',
    subtitle: null,
    category: 'commercial',
    period: '2021',
    tileColor: '#1d6f74',
    pinned: true,
    runnable: false,
    runCommand: null,
    embedUrl: null,
    primaryLanguage: 'TypeScript',
    technologies: ['TypeScript', 'React', 'SCSS', 'Redux', 'Webpack'],
    contributors: [
      { name: 'Богдан Сутужко', image: null, color: '#238636', link: null },
      { name: 'Алексей Мартынов', image: null, color: '#8957e5', link: null },
      { name: 'Мария Волкова', image: null, color: '#1f6feb', link: null },
      { name: 'Иван Петров', image: null, color: '#a371f7', link: null },
    ],
  },
  {
    slug: 'deep-focus',
    title: 'Deep Focus',
    description: 'Pomodoro-трекер продуктивности',
    subtitle: null,
    category: 'side-project',
    period: '2023',
    tileColor: '#6b4ca8',
    pinned: true,
    runnable: false,
    runCommand: null,
    embedUrl: null,
    primaryLanguage: 'TypeScript',
    technologies: ['React', 'TypeScript', 'Node'],
    contributors: [
      { name: 'Богдан Сутужко', image: null, color: '#238636', link: null },
      { name: 'Гвозденков', image: null, color: '#db6d28', link: null },
    ],
  },
];

const meta = {
  title: 'Widgets/Featured',
  component: Featured,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: { projects, onSelect: fn(), onViewAll: fn() },
  argTypes: {
    projects: { control: 'object', table: { category: 'Контент' } },
    isLoading: { control: 'boolean', table: { category: 'Состояние' } },
    onSelect: { control: false, table: { category: 'События' } },
    onViewAll: { control: false, table: { category: 'События' } },
    id: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-page)' }}>{Story()}</div>],
} satisfies Meta<typeof Featured>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Плитки-градиенты. play: клик по плитке открывает проект по slug. */
export const Playground: Story = {
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Procharity')).toBeInTheDocument();
    await expect(canvas.getByText('Deep Focus')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /Procharity/ }));
    await expect(args.onSelect).toHaveBeenCalledWith('procharity');
  },
};

/** Ссылка «Все проекты» вызывает onViewAll. */
export const ViewAll: Story = {
  name: 'Переход ко всем проектам',
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const all = canvas.getAllByRole('button').find((b) => /все проекты/i.test(b.textContent ?? ''));
    if (!all) throw new Error('Кнопка «Все проекты» не найдена');
    await userEvent.click(all);
    await expect(args.onViewAll).toHaveBeenCalled();
  },
};

/** Список грузится — скелетоны плиток. */
export const Loading: Story = {
  name: 'Скелетоны загрузки',
  args: { projects: undefined, isLoading: true },
};

/** Край: единственный закреплённый проект. */
export const SingleProject: Story = {
  name: 'Край: один проект',
  args: { projects: projects.slice(0, 1) },
};

/** Мобильная раскладка: плитки в один столбец. */
export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { ProjectTile, type ProjectTileData } from './ui/project-tile';

const project: ProjectTileData = {
  title: 'Procharity',
  description: 'Платформа интеллектуального волонтёрства, соединяющая НКО и профессионалов.',
  category: 'commercial',
  period: '2021',
  tileColor: 'linear-gradient(135deg, #1d6f74, #0f3d40)',
  runnable: false,
  runCommand: null,
  technologies: ['TypeScript', 'React', 'SCSS', 'Redux', 'Webpack'],
  contributors: [
    { name: 'Богдан', image: null, color: '#238636' },
    { name: 'Алексей', image: null, color: '#8957e5' },
    { name: 'Мария', image: null, color: '#1f6feb' },
    { name: 'Иван', image: null, color: '#a371f7' },
  ],
};

const meta = {
  title: 'Entities/Project/Tile',
  component: ProjectTile,
  parameters: { layout: 'centered', controls: { expanded: true } },
  args: { project, onOpen: fn() },
  argTypes: {
    project: { control: 'object', table: { category: 'Контент' } },
    onOpen: { control: false, table: { disable: true } },
  },
  decorators: [(Story) => <div style={{ width: 320 }}>{Story()}</div>],
} satisfies Meta<typeof ProjectTile>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Кликабельная плитка (есть `onOpen`) — семантическая `<button>`. */
export const Playground: Story = {
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Procharity/ }));
    await expect(args.onOpen).toHaveBeenCalled();
  },
};

/** Запускаемый проект — маркер `▶ run <cmd>`. */
export const Runnable: Story = {
  name: 'Запускаемый проект',
  args: {
    project: {
      ...project,
      title: '2048',
      description: 'Классическая игра 2048 — запускается прямо в консоли портфолио.',
      category: 'side-project',
      period: '2022',
      tileColor: 'linear-gradient(135deg, #7d4bd1, #3a1d66)',
      runnable: true,
      runCommand: 'run 2048',
      technologies: ['React', 'TypeScript'],
      contributors: [{ name: 'Богдан', image: null, color: '#238636' }],
    },
  },
};

/** Статичная плитка (без `onOpen`) — рендерится как `<div>`, не кликабельна. */
export const Static: Story = {
  name: 'Статичная (предпросмотр)',
  args: { onOpen: undefined },
};

/** Край: без контрибьюторов и с одним тегом. */
export const Minimal: Story = {
  name: 'Край: минимум данных',
  args: {
    project: { ...project, contributors: [], technologies: ['TypeScript'], period: null },
  },
};

/** Мобильная ширина. */
export const Mobile: Story = {
  name: 'Мобильная ширина',
  decorators: [(Story) => <div style={{ width: 300 }}>{Story()}</div>],
};

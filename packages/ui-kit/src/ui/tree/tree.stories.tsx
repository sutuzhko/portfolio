import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, within } from 'storybook/test';

import { Tree, type TreeNode } from './tree';

const nodes: TreeNode[] = [
  {
    id: 'js',
    label: 'JavaScript',
    type: 'folder',
    count: 2,
    children: [
      { id: 'event-loop', label: 'Event loop', type: 'article' },
      { id: 'closures', label: 'Замыкания', type: 'article' },
    ],
  },
  {
    id: 'react',
    label: 'React',
    type: 'folder',
    count: 1,
    children: [{ id: 'hooks', label: 'Хуки', type: 'article' }],
  },
  { id: 'intro', label: 'Введение', type: 'article' },
];

const meta = {
  title: 'Shared/components/Tree',
  component: Tree,

  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },

  args: {
    nodes,
    onSelect: fn(),
    'aria-label': 'База знаний',
    defaultExpandedIds: ['js'],
  },

  argTypes: {
    nodes: {
      control: 'object',
      description: 'Иерархия узлов {id, label, type, count?, children?}.',
      table: { category: 'Контент' },
    },
    defaultExpandedIds: {
      control: 'object',
      description: 'Изначально раскрытые папки.',
      table: { category: 'Состояние' },
    },
    selectedId: { control: false, table: { category: 'Состояние' } },
    onSelect: { control: false, table: { category: 'События' } },
    'aria-label': {
      control: 'text',
      description: 'Подпись дерева для скринридера.',
      table: { category: 'Доступность' },
    },
  },

  decorators: [(Story) => <div style={{ width: 300 }}>{Story()}</div>],
} satisfies Meta<typeof Tree>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Песочница. play: клик по статье вызывает onSelect и помечает её выбранной. */
export const Playground: Story = {
  render: (args) => {
    const [selected, setSelected] = useState('event-loop');
    return (
      <Tree
        {...args}
        selectedId={selected}
        onSelect={(id) => {
          args.onSelect(id);
          setSelected(id);
        }}
      />
    );
  },
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Замыкания'));
    await expect(args.onSelect).toHaveBeenCalledWith('closures');
  },
};

/** Всё свёрнуто (без defaultExpandedIds). */
export const AllCollapsed: Story = {
  name: 'Всё свёрнуто',
  render: () => {
    const [selected, setSelected] = useState<string>();
    return (
      <Tree aria-label="База знаний" nodes={nodes} selectedId={selected} onSelect={setSelected} />
    );
  },
};

/** Глубокая вложенность (отступ по уровню). */
export const DeepNesting: Story = {
  name: 'Глубокая вложенность',
  render: () => {
    const deep: TreeNode[] = [
      {
        id: 'frontend',
        label: 'Frontend',
        type: 'folder',
        count: 1,
        children: [
          {
            id: 'react',
            label: 'React',
            type: 'folder',
            count: 1,
            children: [
              {
                id: 'patterns',
                label: 'Паттерны',
                type: 'folder',
                count: 1,
                children: [{ id: 'compound', label: 'Compound components', type: 'article' }],
              },
            ],
          },
        ],
      },
    ];
    const [selected, setSelected] = useState('compound');
    return (
      <Tree
        aria-label="Дерево"
        nodes={deep}
        selectedId={selected}
        onSelect={setSelected}
        defaultExpandedIds={['frontend', 'react', 'patterns']}
      />
    );
  },
};

/** Край: пустая папка раскрывается, но детей не показывает. */
export const EmptyFolder: Story = {
  name: 'Край: пустая папка',
  render: () => {
    const [selected, setSelected] = useState<string>();
    return (
      <Tree
        aria-label="Дерево"
        nodes={[{ id: 'drafts', label: 'Черновики', type: 'folder', count: 0, children: [] }]}
        selectedId={selected}
        onSelect={setSelected}
        defaultExpandedIds={['drafts']}
      />
    );
  },
};

/** Клавиатура: ↑↓ по видимым узлам. */
export const KeyboardNavigation: Story = {
  name: 'Навигация ↑↓',
  render: () => {
    const [selected, setSelected] = useState('intro');
    return (
      <Tree
        aria-label="База знаний"
        nodes={nodes}
        selectedId={selected}
        onSelect={setSelected}
        defaultExpandedIds={['js']}
      />
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    // Имя treeitem включает вложенные узлы — целимся через ярлык → ближайший li.
    const first = canvas.getByText('Event loop').closest('li');
    if (!(first instanceof HTMLElement)) {
      throw new Error('Не найден узел дерева');
    }
    first.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByText('Замыкания').closest('li')).toHaveFocus();
  },
};

/** Клавиатура: → раскрывает свёрнутую папку, ← сворачивает. */
export const ExpandCollapse: Story = {
  name: 'Раскрытие ← →',
  render: () => {
    const [selected, setSelected] = useState<string>();
    return (
      <Tree aria-label="База знаний" nodes={nodes} selectedId={selected} onSelect={setSelected} />
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const folder = canvas.getByText('JavaScript').closest('li');
    if (!(folder instanceof HTMLElement)) {
      throw new Error('Не найдена папка');
    }
    folder.focus();
    await expect(folder).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{ArrowRight}');
    await expect(folder).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowLeft}');
    await expect(folder).toHaveAttribute('aria-expanded', 'false');
  },
};

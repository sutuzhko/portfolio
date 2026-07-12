import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { mockDatabaseTree } from '@/entities/kb/mocks';

import { KbTree } from './ui/kb-tree';

const meta = {
  title: 'Widgets/KbTree',
  component: KbTree,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: {
    tree: mockDatabaseTree,
    selectedSlug: 'react-hooks',
    onSelectArticle: fn(),
  },
  argTypes: {
    tree: { control: false, table: { category: 'Данные' } },
    selectedSlug: { control: 'text', table: { category: 'Состояние' } },
    onSelectArticle: { control: false, table: { category: 'События' } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 264 }}>{Story()}</div>],
} satisfies Meta<typeof KbTree>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Дерево',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Как устроен Fiber'));
    await expect(args.onSelectArticle).toHaveBeenCalledWith('react-fiber');
  },
};

/** Без выбранной статьи. */
export const NoSelection: Story = {
  name: 'Без выбора',
  args: { selectedSlug: undefined },
};

/** Дерево ещё грузится — скелетон. */
export const Loading: Story = {
  name: 'Загрузка',
  args: { tree: undefined },
};

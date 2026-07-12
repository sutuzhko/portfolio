import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { Tree, type TreeNode } from './tree';

const nodes: TreeNode[] = [
  {
    id: 'js',
    label: 'JavaScript',
    type: 'folder',
    count: 1,
    children: [{ id: 'event-loop', label: 'Event loop', type: 'article' }],
  },
  { id: 'intro', label: 'Введение', type: 'article' },
];

describe('Tree', () => {
  it('рендерит дерево с уровнями и раскрытием папки', () => {
    render(<Tree aria-label="БЗ" nodes={nodes} onSelect={vi.fn()} defaultExpandedIds={['js']} />);

    expect(screen.getByRole('tree', { name: 'БЗ' })).toBeInTheDocument();
    expect(screen.getByRole('treeitem', { name: /JavaScript/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('treeitem', { name: 'Event loop' })).toBeInTheDocument();
  });

  it('сворачивает папку по клику', async () => {
    render(<Tree aria-label="БЗ" nodes={nodes} onSelect={vi.fn()} defaultExpandedIds={['js']} />);

    await userEvent.click(screen.getByRole('treeitem', { name: /JavaScript/ }));

    expect(screen.getByRole('treeitem', { name: /JavaScript/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByRole('treeitem', { name: 'Event loop' })).not.toBeInTheDocument();
  });

  it('выбирает статью по клику', async () => {
    const onSelect = vi.fn();
    render(<Tree aria-label="БЗ" nodes={nodes} onSelect={onSelect} defaultExpandedIds={['js']} />);

    await userEvent.click(screen.getByRole('treeitem', { name: 'Event loop' }));

    expect(onSelect).toHaveBeenCalledWith('event-loop');
  });

  it('помечает выбранную статью через aria-selected', () => {
    render(
      <Tree
        aria-label="БЗ"
        nodes={nodes}
        selectedId="event-loop"
        onSelect={vi.fn()}
        defaultExpandedIds={['js']}
      />,
    );

    expect(screen.getByRole('treeitem', { name: 'Event loop' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('не нарушает доступность', async () => {
    const { container } = render(
      <Tree aria-label="БЗ" nodes={nodes} onSelect={vi.fn()} defaultExpandedIds={['js']} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

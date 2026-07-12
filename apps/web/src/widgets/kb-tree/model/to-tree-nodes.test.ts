import { describe, expect, it } from 'vitest';

import { mockDatabaseTree } from '@/entities/kb/mocks';

import { toTreeNodes, topLevelFolderIds } from './to-tree-nodes';

describe('toTreeNodes', () => {
  it('папки идут перед статьями корня', () => {
    const nodes = toTreeNodes(mockDatabaseTree);
    const folderCount = mockDatabaseTree.folders.length;

    expect(nodes.slice(0, folderCount).every((node) => node.type === 'folder')).toBe(true);
    expect(nodes[folderCount]?.type).toBe('article');
  });

  it('id статьи = её slug, id папки = её id', () => {
    const [firstFolder] = toTreeNodes(mockDatabaseTree);
    expect(firstFolder?.type).toBe('folder');
    expect(firstFolder?.id).toBe('f1');

    const articleChild = firstFolder?.children?.find((node) => node.type === 'article');
    expect(articleChild?.id).toBe('react-hooks');
  });

  it('count папки = число прямых статей', () => {
    const [firstFolder] = toTreeNodes(mockDatabaseTree);
    expect(firstFolder?.count).toBe(2);
  });

  it('topLevelFolderIds возвращает id папок верхнего уровня', () => {
    expect(topLevelFolderIds(mockDatabaseTree)).toEqual(['f1', 'f2']);
  });
});

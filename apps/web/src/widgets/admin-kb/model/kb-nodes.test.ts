import { describe, expect, it } from 'vitest';

import type { ArticleStub, DatabaseTree, FolderNode } from '@/entities/kb';

import { countArticles, countFolders, flattenTree, folderOptions } from './kb-nodes';

const stub = (id: string, slug: string, title: string): ArticleStub => ({
  id,
  slug,
  title,
  tags: [],
  status: 'PUBLISHED',
  order: 0,
});

const folder = (
  id: string,
  name: string,
  articles: ArticleStub[],
  children: FolderNode[],
): FolderNode => ({ id, name, order: 0, articles, children });

// Frontend { Hooks; вложенная React { Fiber } } + корневая статья Welcome.
const tree: DatabaseTree = {
  folders: [
    folder(
      'f1',
      'Frontend',
      [stub('a1', 'hooks', 'Хуки')],
      [folder('f1a', 'React', [stub('a2', 'fiber', 'Fiber')], [])],
    ),
  ],
  rootArticles: [stub('a0', 'welcome', 'Welcome')],
};

describe('flattenTree', () => {
  it('свёрнутое дерево показывает только папки верхнего уровня и корневые статьи', () => {
    const rows = flattenTree(tree, new Set());
    expect(rows.map((row) => (row.kind === 'folder' ? `f:${row.id}` : `a:${row.slug}`))).toEqual([
      'f:f1',
      'a:welcome',
    ]);
  });

  it('раскрытая папка выдаёт вложенные папки выше статей, с ростом глубины', () => {
    const rows = flattenTree(tree, new Set(['f1', 'f1a']));
    expect(rows).toEqual([
      expect.objectContaining({ kind: 'folder', id: 'f1', depth: 0, count: 1, expanded: true }),
      expect.objectContaining({ kind: 'folder', id: 'f1a', depth: 1, count: 1 }),
      expect.objectContaining({ kind: 'article', slug: 'fiber', depth: 2 }),
      expect.objectContaining({ kind: 'article', slug: 'hooks', depth: 1 }),
      expect.objectContaining({ kind: 'article', slug: 'welcome', depth: 0 }),
    ]);
  });

  it('строка статьи несёт id (нужен для правки/удаления)', () => {
    const rows = flattenTree(tree, new Set(['f1']));
    const article = rows.find((row) => row.kind === 'article' && row.slug === 'hooks');
    expect(article).toMatchObject({ kind: 'article', id: 'a1', slug: 'hooks' });
  });
});

describe('folderOptions / счётчики', () => {
  it('folderOptions — все папки плоско, с глубиной', () => {
    expect(folderOptions(tree)).toEqual([
      { id: 'f1', label: 'Frontend', depth: 0 },
      { id: 'f1a', label: 'React', depth: 1 },
    ]);
  });

  it('countFolders считает вложенные, countArticles — во всех папках и корне', () => {
    expect(countFolders(tree)).toBe(2);
    expect(countArticles(tree)).toBe(3);
  });
});

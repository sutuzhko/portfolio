import { describe, expect, it } from 'vitest';

import type { DatabaseTree } from '@/entities/kb';
import { mockDatabaseTree } from '@/entities/kb/mocks';

import { firstArticleSlug } from './first-article';

describe('firstArticleSlug', () => {
  it('возвращает первую статью корня, если она есть', () => {
    expect(firstArticleSlug(mockDatabaseTree)).toBe('welcome');
  });

  it('без корневых статей берёт первую статью первой папки', () => {
    const tree: DatabaseTree = { ...mockDatabaseTree, rootArticles: [] };
    expect(firstArticleSlug(tree)).toBe('react-hooks');
  });

  it('возвращает undefined для пустого дерева', () => {
    expect(firstArticleSlug({ folders: [], rootArticles: [] })).toBeUndefined();
  });
});

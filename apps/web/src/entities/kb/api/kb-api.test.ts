import { describe, expect, it } from 'vitest';

import { makeStore } from '@/shared/store';

import { kbApi } from './kb-api';

describe('kbApi', () => {
  it('getDatabaseTree возвращает папки и статьи корня', async () => {
    const store = makeStore();
    const result = await store.dispatch(kbApi.endpoints.getDatabaseTree.initiate('ru'));

    expect(result.data?.folders.map((folder) => folder.name)).toEqual(['Frontend', 'TypeScript']);
    expect(result.data?.rootArticles[0]?.slug).toBe('welcome');
  });

  it('getArticle возвращает тело, хлебные крошки и бэклинки', async () => {
    const store = makeStore();
    const result = await store.dispatch(
      kbApi.endpoints.getArticle.initiate({ slug: 'react-hooks', language: 'ru' }),
    );

    expect(result.data?.title).toBe('Хуки React');
    expect(result.data?.breadcrumb).toEqual(['Frontend', 'Хуки React']);
    expect(result.data?.backlinks.map((link) => link.slug)).toEqual(['welcome', 'ts-generics']);
  });

  it('локализует статью по языку', async () => {
    const store = makeStore();
    const result = await store.dispatch(
      kbApi.endpoints.getArticle.initiate({ slug: 'react-hooks', language: 'en' }),
    );

    expect(result.data?.title).toBe('React hooks');
  });

  it('несуществующий slug → ошибка (404)', async () => {
    const store = makeStore();
    const result = await store.dispatch(
      kbApi.endpoints.getArticle.initiate({ slug: 'nope', language: 'ru' }),
    );

    expect(result.isError).toBe(true);
  });
});

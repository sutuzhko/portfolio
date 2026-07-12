import { http, HttpResponse } from 'msw';

import { env, normalizeLanguage, type AppLanguage } from '@/shared/config';

import type {
  ArticleAdmin,
  ArticleDetail,
  ArticleStub,
  CreateArticle,
  CreateFolder,
  DatabaseTree,
  FolderAdmin,
  FolderNode,
  LocalizedText,
  PublishStatus,
  UpdateArticle,
  UpdateFolder,
} from '../model/types';

// Плоское состояние (папки + статьи), из которого собирается дерево и админ-списки.
// MSW-мок держит его в памяти, чтобы CRUD из кабинета отражался в дереве без бэка.

interface FolderRecord {
  id: string;
  name: LocalizedText;
  parentId: string | null;
  order: number;
}

interface ArticleRecord {
  id: string;
  slug: string;
  title: LocalizedText;
  bodyMarkdown: LocalizedText;
  tags: string[];
  status: PublishStatus;
  order: number;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

const dual = (ru: string, en: string): LocalizedText => ({ ru, en });
const at = (day: string): string => `2026-06-${day}T10:00:00.000Z`;

function seedFolders(): FolderRecord[] {
  return [
    { id: 'f1', name: dual('Frontend', 'Frontend'), parentId: null, order: 0 },
    { id: 'f2', name: dual('TypeScript', 'TypeScript'), parentId: null, order: 1 },
  ];
}

function seedArticles(): ArticleRecord[] {
  return [
    {
      id: 'a-welcome',
      slug: 'welcome',
      title: dual('О базе знаний', 'About the knowledge base'),
      bodyMarkdown: dual(
        'Здесь я собираю конспекты и разборы со связями между статьями.\n\nНавигация — по дереву слева или по вики-ссылкам вроде [[react-hooks]] прямо в тексте.',
        'Here I keep notes and deep-dives with links between articles.\n\nNavigate via the tree on the left or via wiki-links like [[react-hooks]] inside the text.',
      ),
      tags: ['meta'],
      status: 'PUBLISHED',
      order: 0,
      folderId: null,
      createdAt: at('20'),
      updatedAt: at('20'),
    },
    {
      id: 'a-hooks',
      slug: 'react-hooks',
      title: dual('Хуки React', 'React hooks'),
      bodyMarkdown: dual(
        '## Правила хуков\n\nХуки вызываются на верхнем уровне компонента и только из React-функций.\n\nПорядок вызова между рендерами должен быть стабильным — на этом держится сопоставление состояния.',
        '## Rules of hooks\n\nHooks run at the top level of a component and only from React functions.\n\nThe call order must stay stable between renders — that is how state is matched up.',
      ),
      tags: ['react', 'hooks'],
      status: 'PUBLISHED',
      order: 0,
      folderId: 'f1',
      createdAt: at('28'),
      updatedAt: at('28'),
    },
    {
      id: 'a-fiber',
      slug: 'react-fiber',
      title: dual('Как устроен Fiber', 'How Fiber works'),
      bodyMarkdown: dual(
        'Fiber — это переписанный движок согласования с прерываемым рендерингом.\n\nРабота делится на единицы, которые планировщик может ставить на паузу и возобновлять.',
        'Fiber is the rewritten reconciliation engine with interruptible rendering.\n\nWork is split into units the scheduler can pause and resume.',
      ),
      tags: ['react', 'internals'],
      status: 'PUBLISHED',
      order: 1,
      folderId: 'f1',
      createdAt: at('25'),
      updatedAt: at('25'),
    },
    {
      id: 'a-generics',
      slug: 'ts-generics',
      title: dual('Дженерики на практике', 'Generics in practice'),
      bodyMarkdown: dual(
        'Дженерики сохраняют связь типов вход/выход без потери информации.\n\nХороший пример пользы — типобезопасные хуки, см. [[react-hooks]].',
        'Generics keep the input/output type relationship without losing information.\n\nA good example is type-safe hooks, see [[react-hooks]].',
      ),
      tags: ['typescript'],
      status: 'PUBLISHED',
      order: 0,
      folderId: 'f2',
      createdAt: at('30'),
      updatedAt: at('30'),
    },
  ];
}

let folders: FolderRecord[] = seedFolders();
let articles: ArticleRecord[] = seedArticles();

/** Сброс состояния мока к начальному сиду — для изоляции тестов. */
export function resetKbMock(): void {
  folders = seedFolders();
  articles = seedArticles();
}

const byOrder = <T extends { order: number }>(a: T, b: T): number => a.order - b.order;
const text = (value: LocalizedText, lang: AppLanguage): string =>
  lang === 'en' ? (value.en ?? value.ru) : value.ru;

const genId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const toStub = (article: ArticleRecord, lang: AppLanguage): ArticleStub => ({
  id: article.id,
  slug: article.slug,
  title: text(article.title, lang),
  tags: [...article.tags],
  status: article.status,
  order: article.order,
});

function buildTree(lang: AppLanguage): DatabaseTree {
  const node = (folder: FolderRecord): FolderNode => ({
    id: folder.id,
    name: text(folder.name, lang),
    order: folder.order,
    children: folders
      .filter((child) => child.parentId === folder.id)
      .sort(byOrder)
      .map(node),
    articles: articles
      .filter((article) => article.folderId === folder.id)
      .sort(byOrder)
      .map((article) => toStub(article, lang)),
  });
  return {
    folders: folders
      .filter((folder) => folder.parentId === null)
      .sort(byOrder)
      .map(node),
    rootArticles: articles
      .filter((article) => article.folderId === null)
      .sort(byOrder)
      .map((article) => toStub(article, lang)),
  };
}

function folderPath(folderId: string | null, lang: AppLanguage): string[] {
  const chain: string[] = [];
  let current = folderId;
  while (current !== null) {
    const folder = folders.find((candidate) => candidate.id === current);
    if (!folder) break;
    chain.unshift(text(folder.name, lang));
    current = folder.parentId;
  }
  return chain;
}

function articleDetail(slug: string, lang: AppLanguage): ArticleDetail | null {
  const article = articles.find((candidate) => candidate.slug === slug);
  if (!article) return null;
  const title = text(article.title, lang);
  // Бэклинки считаем динамически: любая другая статья со ссылкой [[slug]] в теле.
  const backlinks = articles
    .filter(
      (other) =>
        other.id !== article.id && text(other.bodyMarkdown, lang).includes(`[[${article.slug}]]`),
    )
    .map((other) => ({ slug: other.slug, title: text(other.title, lang) }));
  return {
    slug: article.slug,
    title,
    tags: [...article.tags],
    status: article.status,
    updatedAt: article.updatedAt,
    breadcrumb: [...folderPath(article.folderId, lang), title],
    backlinks,
    bodyMarkdown: text(article.bodyMarkdown, lang),
  };
}

const toFolderAdmin = (folder: FolderRecord): FolderAdmin => ({
  id: folder.id,
  name: folder.name,
  parentId: folder.parentId,
  order: folder.order,
});

const toArticleAdmin = (article: ArticleRecord): ArticleAdmin => ({
  id: article.id,
  slug: article.slug,
  title: article.title,
  bodyMarkdown: article.bodyMarkdown,
  tags: [...article.tags],
  status: article.status,
  order: article.order,
  folderId: article.folderId,
  createdAt: article.createdAt,
  updatedAt: article.updatedAt,
});

/** Первый slug статьи по умолчанию — для тестов/историй. */
export const mockArticleSlug = 'react-hooks';

/** MSW-обработчики базы знаний. Локаль читается из `Accept-Language`. */
export const kbHandlers = [
  http.get(`${env.apiBaseUrl}/database/tree`, ({ request }) => {
    const language = normalizeLanguage(request.headers.get('Accept-Language') ?? undefined);
    return HttpResponse.json(buildTree(language));
  }),

  // --- папки ---
  http.get(`${env.apiBaseUrl}/database/folders`, () =>
    HttpResponse.json(folders.map(toFolderAdmin)),
  ),
  http.post<Record<string, never>, CreateFolder>(
    `${env.apiBaseUrl}/database/folders`,
    async ({ request }) => {
      const body = await request.json();
      const parentId = body.parentId ?? null;
      const siblings = folders.filter((folder) => folder.parentId === parentId);
      const record: FolderRecord = {
        id: genId(),
        name: body.name,
        parentId,
        order: body.order ?? siblings.length,
      };
      folders.push(record);
      return HttpResponse.json(toFolderAdmin(record), { status: 201 });
    },
  ),
  http.patch<{ id: string }, UpdateFolder>(
    `${env.apiBaseUrl}/database/folders/:id`,
    async ({ request, params }) => {
      const folder = folders.find((candidate) => candidate.id === params.id);
      if (!folder) return new HttpResponse(null, { status: 404 });
      const body = await request.json();
      if (body.name !== undefined) folder.name = body.name;
      if (body.parentId !== undefined) folder.parentId = body.parentId;
      if (body.order !== undefined) folder.order = body.order;
      return HttpResponse.json(toFolderAdmin(folder));
    },
  ),
  http.delete<{ id: string }>(`${env.apiBaseUrl}/database/folders/:id`, ({ params }) => {
    const hasChildren = folders.some((folder) => folder.parentId === params.id);
    const hasArticles = articles.some((article) => article.folderId === params.id);
    if (hasChildren || hasArticles) return new HttpResponse(null, { status: 400 });
    folders = folders.filter((folder) => folder.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  // --- статьи: admin-роут регистрируем ДО публичного `:slug` ---
  http.get<{ id: string }>(`${env.apiBaseUrl}/database/articles/admin/:id`, ({ params }) => {
    const article = articles.find((candidate) => candidate.id === params.id);
    return article
      ? HttpResponse.json(toArticleAdmin(article))
      : new HttpResponse(null, { status: 404 });
  }),
  http.post<Record<string, never>, CreateArticle>(
    `${env.apiBaseUrl}/database/articles`,
    async ({ request }) => {
      const body = await request.json();
      if (articles.some((article) => article.slug === body.slug)) {
        return new HttpResponse(null, { status: 409 });
      }
      const now = new Date().toISOString();
      const record: ArticleRecord = {
        id: genId(),
        slug: body.slug,
        title: body.title,
        bodyMarkdown: body.bodyMarkdown,
        tags: body.tags ?? [],
        status: body.status ?? 'PUBLISHED',
        order: body.order ?? 0,
        folderId: body.folderId ?? null,
        createdAt: now,
        updatedAt: now,
      };
      articles.push(record);
      return HttpResponse.json(toArticleAdmin(record), { status: 201 });
    },
  ),
  http.patch<{ id: string }, UpdateArticle>(
    `${env.apiBaseUrl}/database/articles/:id`,
    async ({ request, params }) => {
      const article = articles.find((candidate) => candidate.id === params.id);
      if (!article) return new HttpResponse(null, { status: 404 });
      const body = await request.json();
      if (
        body.slug !== undefined &&
        articles.some((other) => other.slug === body.slug && other.id !== params.id)
      ) {
        return new HttpResponse(null, { status: 409 });
      }
      if (body.slug !== undefined) article.slug = body.slug;
      if (body.title !== undefined) article.title = body.title;
      if (body.bodyMarkdown !== undefined) article.bodyMarkdown = body.bodyMarkdown;
      if (body.tags !== undefined) article.tags = body.tags;
      if (body.status !== undefined) article.status = body.status;
      if (body.order !== undefined) article.order = body.order;
      if (body.folderId !== undefined) article.folderId = body.folderId;
      article.updatedAt = new Date().toISOString();
      return HttpResponse.json(toArticleAdmin(article));
    },
  ),
  http.delete<{ id: string }>(`${env.apiBaseUrl}/database/articles/:id`, ({ params }) => {
    articles = articles.filter((article) => article.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get<{ slug: string }>(`${env.apiBaseUrl}/database/articles/:slug`, ({ request, params }) => {
    const language = normalizeLanguage(request.headers.get('Accept-Language') ?? undefined);
    const detail = articleDetail(params.slug, language);
    return detail ? HttpResponse.json(detail) : new HttpResponse(null, { status: 404 });
  }),
];

// Снимки начального состояния — для историй и тестов (без обращения к живому стору).
export const mockDatabaseTree: DatabaseTree = buildTree('ru');
export const mockArticle: ArticleDetail = articleDetail('react-hooks', 'ru') ?? {
  slug: 'react-hooks',
  title: 'Хуки React',
  tags: [],
  status: 'PUBLISHED',
  updatedAt: at('28'),
  breadcrumb: [],
  backlinks: [],
  bodyMarkdown: '',
};
export const mockFoldersAdmin: FolderAdmin[] = seedFolders().map(toFolderAdmin);
const hooksSeed = seedArticles().find((article) => article.slug === 'react-hooks');
export const mockArticleAdmin: ArticleAdmin | null = hooksSeed ? toArticleAdmin(hooksSeed) : null;

import { apiSlice, withLocale } from '@/shared/api';
import type { AppLanguage } from '@/shared/config';

import type {
  ArticleAdmin,
  ArticleDetail,
  CreateArticle,
  CreateFolder,
  DatabaseTree,
  FolderAdmin,
  UpdateArticle,
  UpdateFolder,
} from '../model/types';

/** Аргументы запроса статьи: slug + язык (сегментирует кэш и уходит заголовком). */
export interface ArticleQueryArgs {
  readonly slug: string;
  readonly language: AppLanguage;
}

/**
 * Эндпоинты приватной базы знаний: чтение (дерево, статья по slug) и админ-CRUD
 * (папки, статьи). Приватны на бэкенде (cookie-сессия), фронт вызывает их только
 * за гардом `RequireAuth`. Язык сегментирует кэш RTK Query и уходит заголовком
 * `Accept-Language`. Мутации инвалидируют тег `Kb` → дерево и открытая статья
 * перезапрашиваются; правка конкретной статьи дополнительно освежает её admin-кэш.
 */
export const kbApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getDatabaseTree: build.query<DatabaseTree, AppLanguage>({
      query: (language) => withLocale(language, { url: '/database/tree' }),
      providesTags: ['Kb'],
    }),
    getArticle: build.query<ArticleDetail, ArticleQueryArgs>({
      query: ({ slug, language }) => withLocale(language, { url: `/database/articles/${slug}` }),
      providesTags: ['Kb'],
    }),

    // --- админ: папки ---
    getFolders: build.query<FolderAdmin[], void>({
      query: () => ({ url: '/database/folders' }),
      providesTags: ['Kb'],
    }),
    createFolder: build.mutation<FolderAdmin, CreateFolder>({
      query: (body) => ({ url: '/database/folders', method: 'POST', body }),
      invalidatesTags: ['Kb'],
    }),
    updateFolder: build.mutation<FolderAdmin, { id: string; body: UpdateFolder }>({
      query: ({ id, body }) => ({ url: `/database/folders/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Kb'],
    }),
    deleteFolder: build.mutation<void, string>({
      query: (id) => ({ url: `/database/folders/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Kb'],
    }),

    // --- админ: статьи ---
    getArticleAdmin: build.query<ArticleAdmin, string>({
      query: (id) => ({ url: `/database/articles/admin/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'KbArticle', id }],
    }),
    createArticle: build.mutation<ArticleAdmin, CreateArticle>({
      query: (body) => ({ url: '/database/articles', method: 'POST', body }),
      invalidatesTags: ['Kb'],
    }),
    updateArticle: build.mutation<ArticleAdmin, { id: string; body: UpdateArticle }>({
      query: ({ id, body }) => ({ url: `/database/articles/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => ['Kb', { type: 'KbArticle', id }],
    }),
    deleteArticle: build.mutation<void, string>({
      query: (id) => ({ url: `/database/articles/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Kb'],
    }),
  }),
});

export const {
  useGetDatabaseTreeQuery,
  useGetArticleQuery,
  useGetFoldersQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useGetArticleAdminQuery,
  useLazyGetArticleAdminQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
} = kbApi;

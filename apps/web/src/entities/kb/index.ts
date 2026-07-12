export {
  kbApi,
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
} from './api/kb-api';
export { useDatabaseTree } from './model/use-database-tree';
export { useArticle } from './model/use-article';
export { KbMarkdown, type KbMarkdownProps } from './ui/kb-markdown';
export type {
  DatabaseTree,
  FolderNode,
  ArticleStub,
  ArticleDetail,
  ArticleLink,
  PublishStatus,
  LocalizedText,
  FolderAdmin,
  ArticleAdmin,
  CreateFolder,
  UpdateFolder,
  CreateArticle,
  UpdateArticle,
} from './model/types';

// Моки живут в отдельной точке входа './mocks' — чтобы msw не попадал в прод-бандл.

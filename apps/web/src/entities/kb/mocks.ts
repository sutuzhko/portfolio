// Отдельная точка входа для моков сущности: импортируется только тестами и
// app/mocks, поэтому msw и фикстуры не попадают в продакшн-бандл приложения.
export {
  kbHandlers,
  resetKbMock,
  mockDatabaseTree,
  mockArticle,
  mockArticleSlug,
  mockFoldersAdmin,
  mockArticleAdmin,
} from './api/kb.mock';

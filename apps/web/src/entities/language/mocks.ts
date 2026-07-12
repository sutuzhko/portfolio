// Отдельная точка входа для моков сущности: импортируется только тестами и
// app/mocks, поэтому msw и фикстуры не попадают в продакшн-бандл приложения.
export {
  languageHandlers,
  languageAdminHandlers,
  mockLanguages,
  mockLanguagesAdmin,
  resetMockLanguages,
} from './api/language.mock';

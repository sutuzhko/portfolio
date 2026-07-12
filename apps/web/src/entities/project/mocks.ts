// Отдельная точка входа для моков сущности: импортируется только тестами и
// app/mocks, поэтому msw и фикстуры не попадают в продакшн-бандл приложения.
export {
  projectHandlers,
  projectAdminHandlers,
  mockProjects,
  mockProjectDetail,
  mockProjectsAdmin,
  resetMockProjects,
} from './api/project.mock';

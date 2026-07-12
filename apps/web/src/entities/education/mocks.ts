// Отдельная точка входа для моков сущности: импортируется только тестами и
// app/mocks, поэтому msw и фикстуры не попадают в продакшн-бандл приложения.
export {
  educationHandlers,
  educationAdminHandlers,
  mockEducation,
  mockEducationAdmin,
  resetMockEducation,
} from './api/education.mock';

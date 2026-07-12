// Отдельная точка входа для моков сущности: импортируется только тестами и
// app/mocks, поэтому msw и фикстуры не попадают в продакшн-бандл приложения.
export { profileHandlers, mockProfile } from './api/profile.mock';
export { profileAdminHandlers } from './api/profile-admin.mock';
export { mockProfileAdmin, resetMockProfileAdmin } from './api/profile-store.mock';

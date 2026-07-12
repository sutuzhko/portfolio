// Отдельная точка входа для моков сущности: импортируется только тестами и
// app/mocks, поэтому msw и фикстуры не попадают в продакшн-бандл приложения.
export {
  skillHandlers,
  skillAdminHandlers,
  mockSkills,
  mockSkillsAdmin,
  resetMockSkills,
} from './api/skill.mock';

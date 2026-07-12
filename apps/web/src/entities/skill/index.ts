export {
  skillApi,
  useGetSkillsQuery,
  useGetSkillsAdminQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} from './api/skill-api';
export { useSkills } from './model/use-skills';
export type { Skill, SkillAdmin, CreateSkill, UpdateSkill } from './model/types';

// Моки живут в отдельной точке входа './mocks' — чтобы msw не попадал в прод-бандл.

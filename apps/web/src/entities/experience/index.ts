export {
  experienceApi,
  useGetExperienceQuery,
  useGetExperienceAdminQuery,
  useCreateExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
} from './api/experience-api';
export { useExperience } from './model/use-experience';
export type {
  Experience,
  ExperienceAdmin,
  CreateExperience,
  UpdateExperience,
} from './model/types';

// Моки живут в отдельной точке входа './mocks' — чтобы msw не попадал в прод-бандл.

export {
  educationApi,
  useGetEducationQuery,
  useGetEducationAdminQuery,
  useCreateEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
} from './api/education-api';
export { useEducation } from './model/use-education';
export type {
  Education,
  EducationAdmin,
  CreateEducation,
  UpdateEducation,
  EducationType,
} from './model/types';

// Моки живут в отдельной точке входа './mocks' — чтобы msw не попадал в прод-бандл.

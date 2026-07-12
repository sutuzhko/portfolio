export {
  technologyApi,
  useGetTechnologiesQuery,
  useGetTechnologiesAdminQuery,
  useCreateTechnologyMutation,
  useUpdateTechnologyMutation,
  useDeleteTechnologyMutation,
} from './api/technology-api';
export { useTechnologies } from './model/use-technologies';
export type {
  Technology,
  TechnologyAdmin,
  CreateTechnology,
  UpdateTechnology,
} from './model/types';

// Моки живут в отдельной точке входа './mocks' — чтобы msw не попадал в прод-бандл.

export {
  contributorApi,
  useGetContributorsAdminQuery,
  useCreateContributorMutation,
  useUpdateContributorMutation,
  useDeleteContributorMutation,
} from './api/contributor-api';
export type { ContributorAdmin, CreateContributor, UpdateContributor } from './model/types';

// Моки живут в отдельной точке входа './mocks' — чтобы msw не попадал в прод-бандл.

export {
  sessionApi,
  useGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useChangePasswordMutation,
} from './api/session-api';
export { useAuth, type AuthState } from './model/use-auth';
export type { AuthUser, LoginCredentials, UserRole, ChangePassword } from './model/types';

// Моки живут в отдельной точке входа './mocks' — чтобы msw не попадал в прод-бандл.

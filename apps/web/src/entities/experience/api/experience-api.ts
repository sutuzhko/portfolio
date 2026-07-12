import { apiSlice, withLocale } from '@/shared/api';
import type { AppLanguage } from '@/shared/config';

import type {
  CreateExperience,
  Experience,
  ExperienceAdmin,
  UpdateExperience,
} from '../model/types';

/**
 * Эндпоинты опыта работы. Публичный список локализован (роль/локация/буллеты) →
 * язык в аргументе. Админ отдаёт обе локали и CRUD; мутации инвалидируют тег
 * `Experience` → и админ-список, и публичный `getExperience` перезапрашиваются.
 */
export const experienceApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getExperience: build.query<Experience[], AppLanguage>({
      query: (language) => withLocale(language, { url: '/experience' }),
      providesTags: ['Experience'],
    }),
    getExperienceAdmin: build.query<ExperienceAdmin[], void>({
      query: () => ({ url: '/experience/admin' }),
      providesTags: ['Experience'],
    }),
    createExperience: build.mutation<ExperienceAdmin, CreateExperience>({
      query: (body) => ({ url: '/experience', method: 'POST', body }),
      invalidatesTags: ['Experience'],
    }),
    updateExperience: build.mutation<ExperienceAdmin, { id: string; body: UpdateExperience }>({
      query: ({ id, body }) => ({ url: `/experience/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Experience'],
    }),
    deleteExperience: build.mutation<void, string>({
      query: (id) => ({ url: `/experience/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Experience'],
    }),
  }),
});

export const {
  useGetExperienceQuery,
  useGetExperienceAdminQuery,
  useCreateExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
} = experienceApi;

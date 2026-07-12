import { apiSlice, withLocale } from '@/shared/api';
import type { AppLanguage } from '@/shared/config';

import type { CreateEducation, Education, EducationAdmin, UpdateEducation } from '../model/types';

/**
 * Эндпоинты образования. Публичный список локализован (степень/место) → язык в
 * аргументе. Админ отдаёт обе локали и CRUD; мутации инвалидируют тег `Education`
 * → и админ-список, и публичный `getEducation` перезапрашиваются.
 */
export const educationApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getEducation: build.query<Education[], AppLanguage>({
      query: (language) => withLocale(language, { url: '/education' }),
      providesTags: ['Education'],
    }),
    getEducationAdmin: build.query<EducationAdmin[], void>({
      query: () => ({ url: '/education/admin' }),
      providesTags: ['Education'],
    }),
    createEducation: build.mutation<EducationAdmin, CreateEducation>({
      query: (body) => ({ url: '/education', method: 'POST', body }),
      invalidatesTags: ['Education'],
    }),
    updateEducation: build.mutation<EducationAdmin, { id: string; body: UpdateEducation }>({
      query: ({ id, body }) => ({ url: `/education/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Education'],
    }),
    deleteEducation: build.mutation<void, string>({
      query: (id) => ({ url: `/education/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Education'],
    }),
  }),
});

export const {
  useGetEducationQuery,
  useGetEducationAdminQuery,
  useCreateEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
} = educationApi;

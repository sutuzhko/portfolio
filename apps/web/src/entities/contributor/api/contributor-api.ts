import { apiSlice } from '@/shared/api';

import type { ContributorAdmin, CreateContributor, UpdateContributor } from '../model/types';

/**
 * Эндпоинты контрибьюторов (общий каталог участников проектов). Список — для
 * выбора в форме проекта; создание/правка/удаление — чтобы вести каталог прямо
 * при редактировании проекта. Мутации инвалидируют тег `Contributor`, поэтому
 * каталог перезапрашивается и изменения сразу видны в выборе.
 */
export const contributorApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getContributorsAdmin: build.query<ContributorAdmin[], void>({
      query: () => ({ url: '/contributors/admin' }),
      providesTags: ['Contributor'],
    }),
    createContributor: build.mutation<ContributorAdmin, CreateContributor>({
      query: (body) => ({ url: '/contributors', method: 'POST', body }),
      invalidatesTags: ['Contributor'],
    }),
    updateContributor: build.mutation<ContributorAdmin, { id: string; body: UpdateContributor }>({
      query: ({ id, body }) => ({ url: `/contributors/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Contributor'],
    }),
    deleteContributor: build.mutation<void, string>({
      query: (id) => ({ url: `/contributors/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Contributor'],
    }),
  }),
});

export const {
  useGetContributorsAdminQuery,
  useCreateContributorMutation,
  useUpdateContributorMutation,
  useDeleteContributorMutation,
} = contributorApi;

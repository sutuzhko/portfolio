import { apiSlice, withLocale } from '@/shared/api';
import type { AppLanguage } from '@/shared/config';

import type { CreateLanguage, Language, LanguageAdmin, UpdateLanguage } from '../model/types';

/**
 * Эндпоинты языков. Название локализуется → язык в аргументе. Мутации админки
 * инвалидируют тег `Language` → и админ-список, и публичный `getLanguages`
 * перезапрашиваются, поэтому блок языков в резюме сразу отражает правки.
 */
export const languageApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getLanguages: build.query<Language[], AppLanguage>({
      query: (language) => withLocale(language, { url: '/languages' }),
      providesTags: ['Language'],
    }),
    getLanguagesAdmin: build.query<LanguageAdmin[], void>({
      query: () => ({ url: '/languages/admin' }),
      providesTags: ['Language'],
    }),
    createLanguage: build.mutation<LanguageAdmin, CreateLanguage>({
      query: (body) => ({ url: '/languages', method: 'POST', body }),
      invalidatesTags: ['Language'],
    }),
    updateLanguage: build.mutation<LanguageAdmin, { id: string; body: UpdateLanguage }>({
      query: ({ id, body }) => ({ url: `/languages/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Language'],
    }),
    deleteLanguage: build.mutation<void, string>({
      query: (id) => ({ url: `/languages/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Language'],
    }),
  }),
});

export const {
  useGetLanguagesQuery,
  useGetLanguagesAdminQuery,
  useCreateLanguageMutation,
  useUpdateLanguageMutation,
  useDeleteLanguageMutation,
} = languageApi;

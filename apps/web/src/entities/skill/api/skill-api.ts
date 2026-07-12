import { apiSlice, withLocale } from '@/shared/api';
import type { AppLanguage } from '@/shared/config';

import type { CreateSkill, Skill, SkillAdmin, UpdateSkill } from '../model/types';

/**
 * Эндпоинты навыков. Публичный список локализован (язык в аргументе). Мутации
 * админки инвалидируют тег `Skill` → и админ-список, и публичный `getSkills`
 * перезапрашиваются, поэтому экран «Опыт» сразу отражает правки.
 */
export const skillApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getSkills: build.query<Skill[], AppLanguage>({
      query: (language) => withLocale(language, { url: '/skills' }),
      providesTags: ['Skill'],
    }),
    getSkillsAdmin: build.query<SkillAdmin[], void>({
      query: () => ({ url: '/skills/admin' }),
      providesTags: ['Skill'],
    }),
    createSkill: build.mutation<SkillAdmin, CreateSkill>({
      query: (body) => ({ url: '/skills', method: 'POST', body }),
      invalidatesTags: ['Skill'],
    }),
    updateSkill: build.mutation<SkillAdmin, { id: string; body: UpdateSkill }>({
      query: ({ id, body }) => ({ url: `/skills/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Skill'],
    }),
    deleteSkill: build.mutation<void, string>({
      query: (id) => ({ url: `/skills/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Skill'],
    }),
  }),
});

export const {
  useGetSkillsQuery,
  useGetSkillsAdminQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} = skillApi;

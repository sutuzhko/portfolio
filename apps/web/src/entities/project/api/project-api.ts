import { apiSlice, withLocale } from '@/shared/api';
import type { AppLanguage } from '@/shared/config';

import type {
  CreateProject,
  ProjectAdmin,
  ProjectDetail,
  ProjectListItem,
  ProjectMediaAdmin,
  UpdateProject,
  UploadGalleryImage,
} from '../model/types';

/**
 * Эндпоинты проектов. Публичные список/деталь локализованы (title/description/body)
 * → язык в аргументе. Админ отдаёт обе локали и CRUD; мутации инвалидируют тег
 * `Project` → и админ-список, и публичные экраны перезапрашиваются.
 */
export const projectApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getProjects: build.query<ProjectListItem[], AppLanguage>({
      query: (language) => withLocale(language, { url: '/projects' }),
      providesTags: ['Project'],
    }),
    getProject: build.query<ProjectDetail, { slug: string; language: AppLanguage }>({
      query: ({ slug, language }) => withLocale(language, { url: `/projects/${slug}` }),
      providesTags: ['Project'],
    }),
    getProjectsAdmin: build.query<ProjectAdmin[], void>({
      query: () => ({ url: '/projects/admin' }),
      providesTags: ['Project'],
    }),
    createProject: build.mutation<ProjectAdmin, CreateProject>({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      invalidatesTags: ['Project'],
    }),
    updateProject: build.mutation<ProjectAdmin, { id: string; body: UpdateProject }>({
      query: ({ id, body }) => ({ url: `/projects/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: build.mutation<void, string>({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Project'],
    }),
    // Галерея проекта: загрузка идёт multipart (файл + id проекта). Инвалидация
    // `Project` перезапрашивает админ-запись — новый скриншот появляется в форме.
    uploadGalleryImage: build.mutation<ProjectMediaAdmin, UploadGalleryImage>({
      query: ({ projectId, file, altRu, altEn }) => {
        const form = new FormData();
        form.append('file', file);
        form.append('projectId', projectId);
        if (altRu !== undefined) form.append('altRu', altRu);
        if (altEn !== undefined) form.append('altEn', altEn);
        return { url: '/media/gallery', method: 'POST', body: form };
      },
      invalidatesTags: ['Project'],
    }),
    deleteGalleryImage: build.mutation<void, string>({
      query: (mediaId) => ({ url: `/media/${mediaId}`, method: 'DELETE' }),
      invalidatesTags: ['Project'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useGetProjectsAdminQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUploadGalleryImageMutation,
  useDeleteGalleryImageMutation,
} = projectApi;

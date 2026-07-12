import { apiSlice, withLocale } from '@/shared/api';
import type { AppLanguage } from '@/shared/config';

import type {
  AdminContactLink,
  AvatarCrop,
  AvatarResult,
  CreateContact,
  CvResult,
  Profile,
  ProfileAdmin,
  UpdateContact,
  UpdateProfile,
} from '../model/types';

/**
 * Эндпоинты профиля, подключённые к корневому API. Язык — аргумент запроса:
 * он и сегментирует кэш RTK Query по локали, и уходит на бэкенд заголовком
 * `Accept-Language` (см. `withLocale`), поэтому смена языка перезапрашивает данные.
 *
 * Админ-эндпоинты отдают/принимают обе локали; `updateProfile` инвалидирует и
 * публичный, и админский кэш — публичные экраны сразу видят правки.
 */
export const profileApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<Profile, AppLanguage>({
      query: (language) => withLocale(language, { url: '/profile' }),
      providesTags: ['Profile'],
    }),
    getProfileAdmin: build.query<ProfileAdmin, void>({
      query: () => ({ url: '/profile/admin' }),
      providesTags: ['ProfileAdmin'],
    }),
    updateProfile: build.mutation<ProfileAdmin, UpdateProfile>({
      query: (body) => ({ url: '/profile', method: 'PATCH', body }),
      invalidatesTags: ['Profile', 'ProfileAdmin'],
    }),
    // Загрузка фото аватара: файл уходит multipart, ответ — URL. Кэш не трогаем:
    // URL сам сохранится через updateProfile (avatarPhotoUrl в теле PATCH).
    uploadAvatar: build.mutation<AvatarResult, { file: File; crop?: AvatarCrop }>({
      query: ({ file, crop }) => {
        const body = new FormData();
        body.append('file', file);
        if (crop) {
          body.append('cropX', String(crop.x));
          body.append('cropY', String(crop.y));
          body.append('cropWidth', String(crop.size));
          body.append('cropHeight', String(crop.size));
        }
        return { url: '/media/avatar', method: 'POST', body };
      },
    }),
    // Загрузка PDF-резюме: файл уходит multipart, ответ — URL. Локаль проставит
    // updateProfile (cvUrl в теле PATCH мёржится по активной локали).
    uploadCv: build.mutation<CvResult, File>({
      query: (file) => {
        const body = new FormData();
        body.append('file', file);
        return { url: '/media/cv', method: 'POST', body };
      },
    }),
    // Контакты-ссылки правятся отдельным ресурсом; инвалидация обновляет и
    // публичный профиль (иконки контактов на экране «Контакты»).
    addContact: build.mutation<AdminContactLink, CreateContact>({
      query: (body) => ({ url: '/profile/contacts', method: 'POST', body }),
      invalidatesTags: ['Profile', 'ProfileAdmin'],
    }),
    updateContact: build.mutation<AdminContactLink, { id: string; body: UpdateContact }>({
      query: ({ id, body }) => ({ url: `/profile/contacts/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Profile', 'ProfileAdmin'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetProfileAdminQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useUploadCvMutation,
  useAddContactMutation,
  useUpdateContactMutation,
} = profileApi;

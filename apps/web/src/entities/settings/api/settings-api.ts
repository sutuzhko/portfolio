import { apiSlice } from '@/shared/api';

import type { Settings, UpdateSettings } from '../model/types';

/**
 * Эндпоинты настроек сайта. Настройки не локализуются, поэтому один `getSettings`
 * обслуживает и публичную часть, и админку; `updateSettings` инвалидирует кэш.
 */
export const settingsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getSettings: build.query<Settings, void>({
      query: () => ({ url: '/settings' }),
      providesTags: ['Settings'],
    }),
    updateSettings: build.mutation<Settings, UpdateSettings>({
      query: (body) => ({ url: '/settings', method: 'PATCH', body }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;

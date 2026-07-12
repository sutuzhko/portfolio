import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from './axios-base-query';

/**
 * Корневой RTK Query API. Конкретные эндпоинты подключают слои-владельцы
 * сущностей через `apiSlice.injectEndpoints`, поэтому API-слой остаётся
 * централизованным, но не знает о доменных слайсах.
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  // При восстановлении сети перезапрашиваем данные (работает вместе с
  // `setupListeners` в store): офлайн читаем из кэша, онлайн — досинхронизируемся.
  refetchOnReconnect: true,
  // Теги для автоматической инвалидации кэша пополняются при инъекции эндпоинтов.
  tagTypes: [
    'Profile',
    'ProfileAdmin',
    'Session',
    'Settings',
    'Technology',
    'Language',
    'Skill',
    'Education',
    'Experience',
    'Project',
    'Contributor',
    'Kb',
    'KbArticle',
  ],
  endpoints: () => ({}),
});

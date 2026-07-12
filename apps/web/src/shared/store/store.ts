import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { apiSlice } from '@/shared/api';

/**
 * Корневой store. Сейчас содержит только серверный кэш RTK Query —
 * клиентское UI-состояние (тема, язык) намеренно живёт ближе к месту
 * использования (context / i18next), а не в Redux.
 */
export function makeStore() {
  return configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  });
}

export const store = makeStore();

// Включаем события refetchOnReconnect/refetchOnFocus для RTK Query (сам refetch
// на реконнект уже включён в apiSlice) — нужно для досинхронизации после офлайна.
setupListeners(store.dispatch);

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

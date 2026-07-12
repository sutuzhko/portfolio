import { useGetMeQuery } from '../api/session-api';

import type { AuthUser } from './types';

export interface AuthState {
  /** Текущий пользователь или `undefined`, если сессии нет. */
  readonly user: AuthUser | undefined;
  readonly isAuthenticated: boolean;
  /** Первичная проверка сессии ещё идёт — статус пока неизвестен. */
  readonly isLoading: boolean;
}

/**
 * Текущий статус авторизации из серверной сессии (`getMe`). `401` (нет сессии) —
 * это не ошибка приложения, а состояние «не авторизован», поэтому при ошибке
 * пользователь сбрасывается в `undefined` (в т.ч. чтобы не показать устаревшего
 * после выхода).
 */
export function useAuth(): AuthState {
  const { data, isLoading, isError } = useGetMeQuery();

  return {
    user: isError ? undefined : data,
    isAuthenticated: !isError && data !== undefined,
    isLoading,
  };
}

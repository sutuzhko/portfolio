import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import axios, { type AxiosRequestConfig } from 'axios';

import { env } from '@/shared/config';

/**
 * Аргументы запроса, которые описывают эндпоинты RTK Query.
 * Тела/параметры типизируем как unknown (а не any из AxiosRequestConfig),
 * чтобы не протаскивать any сквозь типобезопасный код.
 */
export interface AxiosBaseQueryArgs {
  readonly url: string;
  readonly method?: AxiosRequestConfig['method'];
  readonly body?: unknown;
  readonly params?: Record<string, unknown>;
  readonly headers?: Record<string, string>;
}

/** Нормализованная ошибка: HTTP-статус (если был ответ) и тело/сообщение. */
export interface AxiosBaseQueryError {
  readonly status?: number;
  readonly data: unknown;
}

// Единственный axios-инстанс. withCredentials — для HttpOnly-cookie авторизации (FE-3).
const client = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});

// Эндпоинты, на 401 которых бессмысленно пытаться обновлять сессию:
//   - `/auth/refresh` — иначе рекурсия;
//   - `/auth/login` — 401 здесь значит «неверный логин/пароль», а не «истёк доступ».
const NO_REFRESH_URLS = ['/auth/refresh', '/auth/login'];

// Один общий refresh на все параллельные 401: пока он в полёте, остальные запросы
// ждут его результата, а не поднимают по своему refresh (иначе — ротация-гонка).
let refreshInFlight: Promise<boolean> | null = null;

/**
 * Пытается обновить сессию по HttpOnly refresh-cookie. Бэкенд `POST /auth/refresh`
 * ротирует токены и ставит новые cookie. Возвращает `true`, если сессия продлена.
 */
async function refreshSession(): Promise<boolean> {
  refreshInFlight ??= client
    .post('/auth/refresh')
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

/**
 * baseQuery для RTK Query поверх axios. Держит весь HTTP в одном месте: эндпоинты
 * описывают только url/method/body.
 *
 * Прозрачное продление сессии: access-токен живёт 15 минут, поэтому после паузы
 * (в т.ч. перезагрузки страницы) запрос упирается в `401`. Тогда мы один раз дёргаем
 * `/auth/refresh` (refresh-токен живёт 30 дней) и повторяем исходный запрос — так
 * авторизованный пользователь не разлогинивается на ровном месте и не видит `401`.
 */
export function axiosBaseQuery(): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> {
  return async (args) => {
    const first = await request(args);
    if (!isUnauthorized(first) || NO_REFRESH_URLS.includes(args.url)) {
      return first;
    }

    // 401 на обычном запросе — пробуем продлить сессию и повторить один раз.
    const refreshed = await refreshSession();
    return refreshed ? request(args) : first;
  };
}

type QueryResult = { data: unknown } | { error: AxiosBaseQueryError };

async function request({
  url,
  method = 'GET',
  body,
  params,
  headers,
}: AxiosBaseQueryArgs): Promise<QueryResult> {
  try {
    const { data } = await client.request<unknown>({ url, method, data: body, params, headers });
    return { data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: { status: error.response?.status, data: error.response?.data ?? error.message },
      };
    }
    return { error: { data: error instanceof Error ? error.message : 'Unknown network error' } };
  }
}

function isUnauthorized(result: QueryResult): boolean {
  return 'error' in result && result.error.status === 401;
}

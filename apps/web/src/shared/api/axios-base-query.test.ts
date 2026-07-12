import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/app/mocks/server';
import { mockAuthUser } from '@/entities/session/mocks';
import { env } from '@/shared/config';
import { makeStore } from '@/shared/store';

// Приватный эндпоинт для проверки: `getMe` ходит через тот же axiosBaseQuery.
import { sessionApi } from '@/entities/session/api/session-api';

describe('axiosBaseQuery — авто-refresh на 401', () => {
  it('на 401 продлевает сессию и повторяет исходный запрос', async () => {
    let meCalls = 0;
    let refreshCalls = 0;
    server.use(
      http.get(`${env.apiBaseUrl}/auth/me`, () => {
        meCalls += 1;
        // Первый вызов — «access истёк», после refresh — успех.
        return meCalls === 1
          ? new HttpResponse(null, { status: 401 })
          : HttpResponse.json(mockAuthUser);
      }),
      http.post(`${env.apiBaseUrl}/auth/refresh`, () => {
        refreshCalls += 1;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const store = makeStore();
    const result = await store.dispatch(sessionApi.endpoints.getMe.initiate());

    expect(result.data).toEqual(mockAuthUser);
    expect(refreshCalls).toBe(1);
    expect(meCalls).toBe(2);
  });

  it('если refresh не удался — отдаёт исходный 401, без бесконечных повторов', async () => {
    let meCalls = 0;
    server.use(
      http.get(`${env.apiBaseUrl}/auth/me`, () => {
        meCalls += 1;
        return new HttpResponse(null, { status: 401 });
      }),
      http.post(`${env.apiBaseUrl}/auth/refresh`, () => new HttpResponse(null, { status: 401 })),
    );

    const store = makeStore();
    const result = await store.dispatch(sessionApi.endpoints.getMe.initiate());

    expect(result.isError).toBe(true);
    // Один исходный + одна повторная попытка не делается (refresh провалился).
    expect(meCalls).toBe(1);
  });
});

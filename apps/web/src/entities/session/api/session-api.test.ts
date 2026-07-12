import { describe, expect, it } from 'vitest';

import { makeStore } from '@/shared/store';

import { sessionApi } from './session-api';

const validCredentials = { username: 'admin', password: 'admin12345' };

describe('sessionApi', () => {
  it('getMe без сессии → ошибка (не авторизован)', async () => {
    const store = makeStore();
    const result = await store.dispatch(sessionApi.endpoints.getMe.initiate());
    expect(result.isError).toBe(true);
  });

  it('login валидными данными открывает сессию, getMe возвращает пользователя', async () => {
    const store = makeStore();

    const user = await store
      .dispatch(sessionApi.endpoints.login.initiate(validCredentials))
      .unwrap();
    expect(user).toMatchObject({ username: 'admin', role: 'ADMIN' });

    const me = await store.dispatch(sessionApi.endpoints.getMe.initiate());
    expect(me.data).toMatchObject({ username: 'admin' });
  });

  it('login с неверным паролем отклоняется, сессия не создаётся', async () => {
    const store = makeStore();

    await expect(
      store
        .dispatch(sessionApi.endpoints.login.initiate({ username: 'admin', password: 'nope' }))
        .unwrap(),
    ).rejects.toBeDefined();

    const me = await store.dispatch(sessionApi.endpoints.getMe.initiate());
    expect(me.isError).toBe(true);
  });

  it('logout закрывает сессию', async () => {
    const store = makeStore();

    await store.dispatch(sessionApi.endpoints.login.initiate(validCredentials)).unwrap();
    await store.dispatch(sessionApi.endpoints.logout.initiate()).unwrap();

    const me = await store.dispatch(sessionApi.endpoints.getMe.initiate());
    expect(me.isError).toBe(true);
  });
});

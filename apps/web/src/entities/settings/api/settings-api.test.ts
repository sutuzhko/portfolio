import { describe, expect, it } from 'vitest';

import { makeStore } from '@/shared/store';

import { settingsApi } from './settings-api';

describe('settingsApi', () => {
  it('getSettings отдаёт настройки сайта', async () => {
    const store = makeStore();
    const result = await store.dispatch(settingsApi.endpoints.getSettings.initiate());

    expect(result.data).toMatchObject({
      siteTitle: 'bogdan.sutuzhko',
      defaultTheme: 'dark',
      defaultLang: 'ru',
      consoleGlow: true,
    });
  });

  it('updateSettings применяет частичный PATCH', async () => {
    const store = makeStore();
    const updated = await store
      .dispatch(settingsApi.endpoints.updateSettings.initiate({ defaultTheme: 'light' }))
      .unwrap();

    expect(updated.defaultTheme).toBe('light');
    expect(updated.siteTitle).toBe('bogdan.sutuzhko');
  });
});

import { describe, expect, it } from 'vitest';

import { makeStore } from '@/shared/store';

import { profileApi } from './profile-api';

describe('profileApi (admin)', () => {
  it('getProfileAdmin отдаёт обе локали', async () => {
    const store = makeStore();
    const result = await store.dispatch(profileApi.endpoints.getProfileAdmin.initiate());

    expect(result.data?.roleTitle).toEqual({
      ru: 'Fullstack-разработчик',
      en: 'Full Stack Developer',
    });
    expect(result.data?.name).toEqual({ ru: 'Богдан Сутужко', en: 'Bogdan Sutuzhko' });
  });

  it('updateProfile применяет частичный PATCH и возвращает профиль', async () => {
    const store = makeStore();
    const updated = await store
      .dispatch(profileApi.endpoints.updateProfile.initiate({ name: { ru: 'Изменённое Имя' } }))
      .unwrap();

    // Патч ru мёржится с сохранённой en-локалью.
    expect(updated.name).toEqual({ ru: 'Изменённое Имя', en: 'Bogdan Sutuzhko' });
    // Остальные поля не затронуты.
    expect(updated.email).toBe('julfy.web@gmail.com');
  });
});

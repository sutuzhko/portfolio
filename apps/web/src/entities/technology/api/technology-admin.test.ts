import { describe, expect, it } from 'vitest';

import { makeStore } from '@/shared/store';

import { technologyApi } from './technology-api';

async function adminList(store: ReturnType<typeof makeStore>) {
  const result = await store.dispatch(
    technologyApi.endpoints.getTechnologiesAdmin.initiate(undefined, { forceRefetch: true }),
  );
  return result.data ?? [];
}

describe('technologyApi (admin CRUD)', () => {
  it('создание/обновление/удаление отражаются в админ-списке', async () => {
    const store = makeStore();

    const created = await store
      .dispatch(
        technologyApi.endpoints.createTechnology.initiate({ name: 'Svelte', category: 'Frontend' }),
      )
      .unwrap();
    expect(created).toMatchObject({ name: 'Svelte', category: 'Frontend' });
    expect((await adminList(store)).some((tech) => tech.id === created.id)).toBe(true);

    await store
      .dispatch(
        technologyApi.endpoints.updateTechnology.initiate({
          id: created.id,
          body: { name: 'SvelteKit' },
        }),
      )
      .unwrap();
    expect((await adminList(store)).find((tech) => tech.id === created.id)?.name).toBe('SvelteKit');

    await store.dispatch(technologyApi.endpoints.deleteTechnology.initiate(created.id)).unwrap();
    expect((await adminList(store)).some((tech) => tech.id === created.id)).toBe(false);
  });

  it('изменения видны в публичном списке (общий стейт мока)', async () => {
    const store = makeStore();
    await store
      .dispatch(technologyApi.endpoints.createTechnology.initiate({ name: 'Astro' }))
      .unwrap();

    const result = await store.dispatch(
      technologyApi.endpoints.getTechnologies.initiate('ru', { forceRefetch: true }),
    );
    expect(result.data?.some((tech) => tech.name === 'Astro')).toBe(true);
  });
});

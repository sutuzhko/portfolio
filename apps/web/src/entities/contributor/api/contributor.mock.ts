import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config';

import type { ContributorAdmin, CreateContributor, UpdateContributor } from '../model/types';

function buildInitial(): ContributorAdmin[] {
  return [
    {
      id: 'bogdan',
      name: { ru: 'Богдан Сутужко', en: 'Bogdan Sutuzhko' },
      image: null,
      color: '#238636',
      link: null,
      order: 0,
    },
    {
      id: 'alex',
      name: { ru: 'Алексей Мартынов', en: 'Alexey Martynov' },
      image: null,
      color: '#8957e5',
      link: null,
      order: 1,
    },
    {
      id: 'maria',
      name: { ru: 'Мария Волкова', en: 'Maria Volkova' },
      image: null,
      color: '#1f6feb',
      link: null,
      order: 2,
    },
    {
      id: 'ivan',
      name: { ru: 'Иван Петров', en: 'Ivan Petrov' },
      image: null,
      color: '#a371f7',
      link: null,
      order: 3,
    },
    {
      id: 'gvozdenkov',
      name: { ru: 'Гвозденков', en: 'Gvozdenkov' },
      image: null,
      color: '#db6d28',
      link: null,
      order: 4,
    },
  ];
}

// Состояние каталога мока: create добавляет запись между запросами одного прогона.
let contributors: ContributorAdmin[] = buildInitial();

/** Сбрасывает каталог контрибьюторов мока — для изоляции тестов. */
export function resetMockContributors(): void {
  contributors = buildInitial();
}

/** Фикстура контрибьюторов (админ-вид) для тестов и историй. */
export const mockContributorsAdmin: ContributorAdmin[] = buildInitial();

/** MSW-обработчики контрибьюторов: список + CRUD (создание/правка/удаление). */
export const contributorHandlers = [
  // Как на бэке: каталог по возрастанию `order` (его меняет перетаскивание в админке).
  http.get(`${env.apiBaseUrl}/contributors/admin`, () =>
    HttpResponse.json([...contributors].sort((a, b) => a.order - b.order)),
  ),
  http.post<Record<string, never>, CreateContributor>(
    `${env.apiBaseUrl}/contributors`,
    async ({ request }) => {
      const body = await request.json();
      const created: ContributorAdmin = {
        id: `c-${Date.now()}`,
        name: { ru: body.name.ru, en: body.name.en ?? null },
        image: body.image ?? null,
        color: body.color || null,
        link: body.link ?? null,
        order: body.order ?? contributors.length,
      };
      contributors = [...contributors, created];
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.patch<{ id: string }, UpdateContributor>(
    `${env.apiBaseUrl}/contributors/:id`,
    async ({ request, params }) => {
      const patch = await request.json();
      const current = contributors.find((contributor) => contributor.id === params.id);
      if (!current) return new HttpResponse(null, { status: 404 });
      // Как на бэке (writeText): имя ПЕРЕЗАПИСЫВАЕТСЯ целиком — фронт шлёт обе локали,
      // поэтому потери перевода нет. Остальные поля заменяются, если присланы.
      const updated: ContributorAdmin = {
        ...current,
        name: patch.name ? { ru: patch.name.ru, en: patch.name.en ?? null } : current.name,
        image: patch.image ?? current.image,
        // Пустая строка = сброс цвета → null (как на бэке); undefined = не менять.
        color: patch.color !== undefined ? patch.color || null : current.color,
        link: patch.link ?? current.link,
        order: patch.order ?? current.order,
      };
      contributors = contributors.map((contributor) =>
        contributor.id === params.id ? updated : contributor,
      );
      return HttpResponse.json(updated);
    },
  ),
  http.delete(`${env.apiBaseUrl}/contributors/:id`, ({ params }) => {
    const exists = contributors.some((contributor) => contributor.id === params.id);
    if (!exists) return new HttpResponse(null, { status: 404 });
    contributors = contributors.filter((contributor) => contributor.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];

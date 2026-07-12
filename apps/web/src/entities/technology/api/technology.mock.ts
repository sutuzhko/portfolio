import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config';

import type {
  CreateTechnology,
  Technology,
  TechnologyAdmin,
  UpdateTechnology,
} from '../model/types';

// Технологии — англоязычные термины, одинаковы в обеих локалях. Категория
// (Frontend/Backend/Tooling) курируется на сервере и задаёт группировку.
const BY_CATEGORY: Record<string, readonly string[]> = {
  Frontend: ['React', 'Vue 3', 'Next.js', 'TypeScript', 'SCSS', 'Tailwind'],
  Backend: ['Node', 'NestJS', 'Express', 'MongoDB', 'REST API'],
  Tooling: ['Vite', 'Storybook', 'Jest', 'Cypress', 'Docker', 'Git'],
};

function buildInitial(): TechnologyAdmin[] {
  const result: TechnologyAdmin[] = [];
  for (const [category, names] of Object.entries(BY_CATEGORY)) {
    for (const name of names) {
      result.push({ id: String(result.length), name, category, order: result.length });
    }
  }
  return result;
}

// Общее состояние: и публичный список, и админ-CRUD читают/пишут его, поэтому
// правки в кабинете сразу видны на публичном стеке (как на реальном бэкенде).
let technologies: TechnologyAdmin[] = buildInitial();
let nextId = technologies.length;

/** Сбрасывает технологии мока — для изоляции тестов. */
export function resetMockTechnologies(): void {
  technologies = buildInitial();
  nextId = technologies.length;
}

const toPublic = (tech: TechnologyAdmin): Technology => ({
  id: tech.id,
  name: tech.name,
  category: tech.category,
});

/** Фикстуры технологий для тестов и историй. */
export const mockTechnologies: Technology[] = buildInitial().map(toPublic);
export const mockTechnologiesAdmin: TechnologyAdmin[] = buildInitial();

/** Публичный MSW-обработчик технологий (не локализуются). */
export const technologyHandlers = [
  http.get(`${env.apiBaseUrl}/technologies`, () => HttpResponse.json(technologies.map(toPublic))),
];

/** Админ MSW-обработчики технологий: список + CRUD над общим состоянием. */
export const technologyAdminHandlers = [
  http.get(`${env.apiBaseUrl}/technologies/admin`, () =>
    HttpResponse.json([...technologies].sort((a, b) => a.order - b.order)),
  ),
  http.post<Record<string, never>, CreateTechnology>(
    `${env.apiBaseUrl}/technologies`,
    async ({ request }) => {
      const body = await request.json();
      nextId += 1;
      const created: TechnologyAdmin = {
        id: String(nextId),
        name: body.name,
        category: body.category ?? null,
        order: body.order ?? technologies.length,
      };
      technologies.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.patch<{ id: string }, UpdateTechnology>(
    `${env.apiBaseUrl}/technologies/:id`,
    async ({ request, params }) => {
      const body = await request.json();
      const tech = technologies.find((item) => item.id === params.id);
      if (tech === undefined) return new HttpResponse(null, { status: 404 });
      if (body.name !== undefined) tech.name = body.name;
      if (body.category !== undefined) tech.category = body.category;
      if (body.order !== undefined) tech.order = body.order;
      return HttpResponse.json(tech);
    },
  ),
  http.delete(`${env.apiBaseUrl}/technologies/:id`, ({ params }) => {
    technologies = technologies.filter((item) => item.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];

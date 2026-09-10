import { http, HttpResponse } from 'msw';

import { env, normalizeLanguage, type AppLanguage } from '@/shared/config';

import type {
  CreateExperience,
  Experience,
  ExperienceAdmin,
  UpdateExperience,
} from '../model/types';

type LocalizedText = ExperienceAdmin['role'];
type LocalizedList = ExperienceAdmin['bullets'];
type TextPatch = { ru?: string; en?: string };
type ListPatch = { ru?: string[]; en?: string[] };

// Каталог названий технологий по id — зеркалит сид сущности technology, чтобы
// публичный список опыта резолвил technologyIds → имена без кросс-импорта слоёв.
const TECH_CATALOG: Record<string, string> = {
  '0': 'React',
  '1': 'Vue 3',
  '2': 'Next.js',
  '3': 'TypeScript',
  '4': 'SCSS',
  '5': 'Tailwind',
  '6': 'Node',
  '7': 'NestJS',
  '8': 'Express',
  '9': 'MongoDB',
  '10': 'REST API',
  '11': 'Vite',
  '12': 'Storybook',
  '13': 'Jest',
  '14': 'Cypress',
  '15': 'Docker',
  '16': 'Git',
};

function buildInitial(): ExperienceAdmin[] {
  return [
    {
      id: 'go-mobile',
      role: { ru: 'Frontend-разработчик', en: 'Frontend Developer' },
      company: 'Go Mobile',
      location: { ru: 'Москва, Россия', en: 'Moscow, Russia' },
      sub: { ru: 'Внутренние продукты и UI-kit', en: 'Internal products and UI kit' },
      bullets: {
        ru: [
          'Строю корпоративный UI-kit с нуля на Radix UI и Storybook',
          'Внедрил визуальные тесты (Chromatic) и покрытие компонентов',
          'Оптимизировал сборку и время загрузки внутренних панелей',
        ],
        en: [
          'Building a corporate UI kit from scratch with Radix UI and Storybook',
          'Introduced visual testing (Chromatic) and component coverage',
          'Optimized the build and load time of internal dashboards',
        ],
      },
      startDate: '2023-01-01T00:00:00.000Z',
      endDate: null,
      current: true,
      dotColor: '#3fb950',
      technologyIds: ['0', '3', '12', '11'],
    },
    {
      id: 'procharity',
      role: { ru: 'Fullstack-разработчик', en: 'Fullstack Developer' },
      company: 'Procharity',
      location: { ru: 'Удалённо', en: 'Remote' },
      sub: { ru: 'Procharity', en: 'Procharity' },
      bullets: {
        ru: [
          'Вёл ключевые фичи фронтенда платформы волонтёрства',
          'Собрал дизайн-систему на SCSS и переиспользуемые компоненты',
          'Список задач с фильтрами держал десятки тысяч записей',
        ],
        en: [
          'Led key frontend features of the volunteering platform',
          'Built an SCSS design system and reusable components',
          'The filtered task list handled tens of thousands of records',
        ],
      },
      startDate: '2021-01-01T00:00:00.000Z',
      endDate: '2023-01-01T00:00:00.000Z',
      current: false,
      dotColor: '#238636',
      technologyIds: ['1', '3', '4'],
    },
  ];
}

// Общее состояние: публичный список и админ-CRUD читают/пишут его — правки в
// кабинете сразу видны на публичном экране опыта (как на реальном бэкенде).
let records: ExperienceAdmin[] = buildInitial();
let nextId = records.length;

/** Сбрасывает опыт мока — для изоляции тестов. */
export function resetMockExperience(): void {
  records = buildInitial();
  nextId = records.length;
}

function localizedText(text: LocalizedText | null, language: AppLanguage): string | null {
  if (!text) return null;
  return (language === 'en' ? text.en : text.ru) ?? text.ru ?? null;
}

function localizedList(list: LocalizedList, language: AppLanguage): string[] {
  return (language === 'en' ? list.en : list.ru) ?? list.ru;
}

function mergeText(existing: LocalizedText | null, patch: TextPatch): LocalizedText {
  const current = existing ?? { ru: '' };
  const ru = patch.ru ?? current.ru;
  const en = patch.en ?? current.en ?? undefined;
  return en === undefined ? { ru } : { ru, en };
}

function mergeList(existing: LocalizedList, patch: ListPatch): LocalizedList {
  const ru = patch.ru ?? existing.ru;
  const en = patch.en ?? existing.en ?? undefined;
  return en === undefined ? { ru } : { ru, en };
}

function toPublic(record: ExperienceAdmin, language: AppLanguage): Experience {
  return {
    id: record.id,
    role: localizedText(record.role, language) ?? '',
    company: record.company,
    location: localizedText(record.location, language),
    sub: localizedText(record.sub, language),
    bullets: localizedList(record.bullets, language),
    startDate: record.startDate,
    endDate: record.endDate,
    current: record.current,
    dotColor: record.dotColor,
    technologies: record.technologyIds.map((id) => TECH_CATALOG[id] ?? id),
  };
}

// Как на бэке: свежее выше — по убыванию даты начала.
const sorted = (): ExperienceAdmin[] =>
  [...records].sort((a, b) => b.startDate.localeCompare(a.startDate));

/** Фикстура опыта (русская локаль) для тестов и историй. */
export const mockExperience: Experience[] = sorted().map((record) => toPublic(record, 'ru'));

/** Фикстура опыта в админ-виде (обе локали). */
export const mockExperienceAdmin: ExperienceAdmin[] = buildInitial();

/** Публичный MSW-обработчик опыта. Локаль читается из `Accept-Language`. */
export const experienceHandlers = [
  http.get(`${env.apiBaseUrl}/experience`, ({ request }) => {
    const language = normalizeLanguage(request.headers.get('Accept-Language') ?? undefined);
    return HttpResponse.json(sorted().map((record) => toPublic(record, language)));
  }),
];

/** Админ MSW-обработчики опыта: список обеих локалей + CRUD над общим состоянием. */
export const experienceAdminHandlers = [
  http.get(`${env.apiBaseUrl}/experience/admin`, () => HttpResponse.json(sorted())),
  http.post<Record<string, never>, CreateExperience>(
    `${env.apiBaseUrl}/experience`,
    async ({ request }) => {
      const body = await request.json();
      nextId += 1;
      const created: ExperienceAdmin = {
        id: String(nextId),
        role: { ru: body.role.ru, en: body.role.en },
        company: body.company,
        location: body.location ? { ru: body.location.ru, en: body.location.en } : null,
        sub: body.sub ? { ru: body.sub.ru, en: body.sub.en } : null,
        bullets: { ru: body.bullets.ru, en: body.bullets.en },
        startDate: body.startDate,
        endDate: body.endDate ?? null,
        current: body.current ?? false,
        dotColor: body.dotColor ?? null,
        technologyIds: body.technologyIds ?? [],
      };
      records.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.patch<{ id: string }, UpdateExperience>(
    `${env.apiBaseUrl}/experience/:id`,
    async ({ request, params }) => {
      const body = await request.json();
      const record = records.find((item) => item.id === params.id);
      if (record === undefined) return new HttpResponse(null, { status: 404 });
      if (body.role !== undefined) record.role = mergeText(record.role, body.role);
      if (body.company !== undefined) record.company = body.company;
      if (body.location !== undefined) record.location = mergeText(record.location, body.location);
      if (body.sub !== undefined) record.sub = mergeText(record.sub, body.sub);
      if (body.bullets !== undefined) record.bullets = mergeList(record.bullets, body.bullets);
      if (body.startDate !== undefined) record.startDate = body.startDate;
      if (body.endDate !== undefined) record.endDate = body.endDate;
      if (body.current !== undefined) record.current = body.current;
      if (body.dotColor !== undefined) record.dotColor = body.dotColor;
      if (body.technologyIds !== undefined) record.technologyIds = body.technologyIds;
      return HttpResponse.json(record);
    },
  ),
  http.delete(`${env.apiBaseUrl}/experience/:id`, ({ params }) => {
    records = records.filter((item) => item.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];

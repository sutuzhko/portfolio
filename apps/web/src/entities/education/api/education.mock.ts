import { http, HttpResponse } from 'msw';

import { env, normalizeLanguage, type AppLanguage } from '@/shared/config';

import type { CreateEducation, Education, EducationAdmin, UpdateEducation } from '../model/types';

type Localized = EducationAdmin['degree'];
type LocalePatch = { ru?: string; en?: string };

function buildInitial(): EducationAdmin[] {
  return [
    {
      id: 'mslu',
      type: 'MAIN',
      degree: { ru: 'Бакалавр лингвистики', en: 'BA in Linguistics' },
      place: { ru: 'МГЛУ, Москва', en: 'MSLU, Moscow' },
      startDate: '2014-09-01T00:00:00.000Z',
      endDate: '2018-06-01T00:00:00.000Z',
    },
    {
      id: 'praktikum',
      type: 'ADDITIONAL',
      degree: { ru: 'Frontend-разработка', en: 'Frontend Development' },
      place: { ru: 'Яндекс Практикум', en: 'Yandex Praktikum' },
      startDate: '2020-03-01T00:00:00.000Z',
      endDate: null,
    },
  ];
}

// Общее состояние: публичный список и админ-CRUD читают/пишут его — правки в
// кабинете сразу видны на публичном образовании (как на реальном бэкенде).
let records: EducationAdmin[] = buildInitial();
let nextId = records.length;

/** Сбрасывает образование мока — для изоляции тестов. */
export function resetMockEducation(): void {
  records = buildInitial();
  nextId = records.length;
}

// Значение локали с фолбэком на ru — как localize на бэкенде.
function localized(text: Localized, language: AppLanguage): string {
  return (language === 'en' ? text.en : text.ru) ?? text.ru;
}

// Накладывает патч одной локали на сохранённое значение (мёрж, как mergeText).
function mergeLocale(existing: Localized | null, patch: LocalePatch): Localized {
  const current = existing ?? { ru: '' };
  const ru = patch.ru ?? current.ru;
  const en = patch.en ?? current.en ?? undefined;
  return en === undefined ? { ru } : { ru, en };
}

// Как на бэке: окончание раньше начала — 400 (ISO-строки сравниваются лексикографически).
function isValidPeriod(startDate: string, endDate: string | null): boolean {
  return endDate === null || endDate >= startDate;
}

function toPublic(record: EducationAdmin, language: AppLanguage): Education {
  return {
    id: record.id,
    type: record.type,
    degree: localized(record.degree, language),
    place: record.place ? localized(record.place, language) : null,
    startDate: record.startDate,
    endDate: record.endDate,
  };
}

// Как на бэке: свежее выше — по убыванию даты начала.
const sorted = (): EducationAdmin[] =>
  [...records].sort((a, b) => b.startDate.localeCompare(a.startDate));

/** Фикстура образования (русская локаль) для тестов и историй. */
export const mockEducation: Education[] = sorted().map((record) => toPublic(record, 'ru'));

/** Фикстура образования в админ-виде (обе локали). */
export const mockEducationAdmin: EducationAdmin[] = buildInitial();

/** Публичный MSW-обработчик образования. Локаль читается из `Accept-Language`. */
export const educationHandlers = [
  http.get(`${env.apiBaseUrl}/education`, ({ request }) => {
    const language = normalizeLanguage(request.headers.get('Accept-Language') ?? undefined);
    return HttpResponse.json(sorted().map((record) => toPublic(record, language)));
  }),
];

/** Админ MSW-обработчики образования: список обеих локалей + CRUD над общим состоянием. */
export const educationAdminHandlers = [
  http.get(`${env.apiBaseUrl}/education/admin`, () => HttpResponse.json(sorted())),
  http.post<Record<string, never>, CreateEducation>(
    `${env.apiBaseUrl}/education`,
    async ({ request }) => {
      const body = await request.json();
      const endDate = body.endDate ?? null;
      if (!isValidPeriod(body.startDate, endDate)) return new HttpResponse(null, { status: 400 });
      nextId += 1;
      const created: EducationAdmin = {
        id: String(nextId),
        type: body.type ?? 'MAIN',
        degree: { ru: body.degree.ru, en: body.degree.en },
        place: body.place ? { ru: body.place.ru, en: body.place.en } : null,
        startDate: body.startDate,
        endDate,
      };
      records.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.patch<{ id: string }, UpdateEducation>(
    `${env.apiBaseUrl}/education/:id`,
    async ({ request, params }) => {
      const body = await request.json();
      const record = records.find((item) => item.id === params.id);
      if (record === undefined) return new HttpResponse(null, { status: 404 });
      // null снимает окончание, undefined — оставляет (как в UpdateEducationDto).
      const startDate = body.startDate ?? record.startDate;
      const endDate = body.endDate === undefined ? record.endDate : body.endDate;
      if (!isValidPeriod(startDate, endDate)) return new HttpResponse(null, { status: 400 });
      if (body.type !== undefined) record.type = body.type;
      if (body.degree !== undefined) record.degree = mergeLocale(record.degree, body.degree);
      if (body.place !== undefined) record.place = mergeLocale(record.place, body.place);
      record.startDate = startDate;
      record.endDate = endDate;
      return HttpResponse.json(record);
    },
  ),
  http.delete(`${env.apiBaseUrl}/education/:id`, ({ params }) => {
    records = records.filter((item) => item.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];

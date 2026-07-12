import { http, HttpResponse } from 'msw';

import { env, normalizeLanguage, type AppLanguage } from '@/shared/config';

import type { CreateLanguage, Language, LanguageAdmin, UpdateLanguage } from '../model/types';

function buildInitial(): LanguageAdmin[] {
  return [
    { id: 'ru', name: { ru: 'Русский', en: 'Russian' }, level: 'Native', pct: 100, order: 0 },
    { id: 'en', name: { ru: 'Английский', en: 'English' }, level: 'C1', pct: 85, order: 1 },
  ];
}

// Общее состояние: и публичный список, и админ-CRUD читают/пишут его, поэтому
// правки в кабинете сразу видны в блоке языков (как на реальном бэкенде).
let languages: LanguageAdmin[] = buildInitial();
let nextId = languages.length;

/** Сбрасывает языки мока — для изоляции тестов. */
export function resetMockLanguages(): void {
  languages = buildInitial();
  nextId = languages.length;
}

// Публичный проектор: локализует название по активной локали (fallback на ru).
const toPublic = (lang: LanguageAdmin, locale: AppLanguage): Language => ({
  id: lang.id,
  name: locale === 'en' ? (lang.name.en ?? lang.name.ru) : lang.name.ru,
  level: lang.level,
  pct: lang.pct,
});

/** Фикстура языков (русская локаль) для тестов и историй. */
export const mockLanguages: Language[] = buildInitial().map((lang) => toPublic(lang, 'ru'));
/** Фикстура языков в админ-виде. */
export const mockLanguagesAdmin: LanguageAdmin[] = buildInitial();

/** Публичный MSW-обработчик языков. Локаль читается из `Accept-Language`. */
export const languageHandlers = [
  http.get(`${env.apiBaseUrl}/languages`, ({ request }) => {
    const locale = normalizeLanguage(request.headers.get('Accept-Language') ?? undefined);
    return HttpResponse.json(
      [...languages].sort((a, b) => a.order - b.order).map((lang) => toPublic(lang, locale)),
    );
  }),
];

/** Админ MSW-обработчики языков: список + CRUD над общим состоянием. */
export const languageAdminHandlers = [
  http.get(`${env.apiBaseUrl}/languages/admin`, () =>
    HttpResponse.json([...languages].sort((a, b) => a.order - b.order)),
  ),
  http.post<Record<string, never>, CreateLanguage>(
    `${env.apiBaseUrl}/languages`,
    async ({ request }) => {
      const body = await request.json();
      nextId += 1;
      const created: LanguageAdmin = {
        id: String(nextId),
        name: { ru: body.name.ru, en: body.name.en ?? null },
        level: body.level,
        pct: body.pct,
        order: body.order ?? languages.length,
      };
      languages.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.patch<{ id: string }, UpdateLanguage>(
    `${env.apiBaseUrl}/languages/:id`,
    async ({ request, params }) => {
      const body = await request.json();
      const lang = languages.find((item) => item.id === params.id);
      if (lang === undefined) return new HttpResponse(null, { status: 404 });
      // name — LocalizedTextInput (полная замена, как writeText на бэкенде).
      if (body.name !== undefined) lang.name = { ru: body.name.ru, en: body.name.en ?? null };
      if (body.level !== undefined) lang.level = body.level;
      if (body.pct !== undefined) lang.pct = body.pct;
      if (body.order !== undefined) lang.order = body.order;
      return HttpResponse.json(lang);
    },
  ),
  http.delete(`${env.apiBaseUrl}/languages/:id`, ({ params }) => {
    languages = languages.filter((item) => item.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];

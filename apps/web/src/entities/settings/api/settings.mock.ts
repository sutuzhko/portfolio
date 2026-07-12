import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config';

import type { Settings, UpdateSettings } from '../model/types';

const initialSettings: Settings = {
  siteTitle: 'bogdan.sutuzhko',
  defaultTheme: 'dark',
  accentColor: 'green',
  defaultLang: 'ru',
  availableLanguages: ['ru', 'en'],
  consoleGlow: true,
  showHighlights: true,
  showAbout: true,
  showStack: true,
  showActivity: true,
  showNow: true,
  showFeatured: true,
  showProjects: true,
  showExperience: true,
  showContact: true,
};

// Состояние настроек мока: PATCH мутирует между запросами одного прогона.
let settings: Settings = initialSettings;

/** Сбрасывает настройки мока — для изоляции тестов. */
export function resetMockSettings(): void {
  settings = initialSettings;
}

/** Фикстура настроек — для тестов/историй. */
export const mockSettings = initialSettings;

/** MSW-обработчики настроек: чтение и частичный PATCH. */
export const settingsHandlers = [
  http.get(`${env.apiBaseUrl}/settings`, () => HttpResponse.json(settings)),
  http.patch<Record<string, never>, UpdateSettings>(
    `${env.apiBaseUrl}/settings`,
    async ({ request }) => {
      const patch = await request.json();
      settings = { ...settings, ...patch };
      return HttpResponse.json(settings);
    },
  ),
];

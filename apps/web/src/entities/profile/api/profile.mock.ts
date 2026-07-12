import { http, HttpResponse } from 'msw';

import { env, normalizeLanguage } from '@/shared/config';

import { getMockProfileState, localizeProfile } from './profile-store.mock';

export { mockProfile, mockProfileEn } from './profile-store.mock';

/**
 * MSW-обработчики публичного профиля. Локаль читается из `Accept-Language`, а данные —
 * из общего состояния (см. `profile-store.mock`), поэтому правка в CRM сразу видна здесь.
 */
export const profileHandlers = [
  http.get(`${env.apiBaseUrl}/profile`, ({ request }) => {
    const language = normalizeLanguage(request.headers.get('Accept-Language') ?? undefined);
    return HttpResponse.json(localizeProfile(getMockProfileState(), language));
  }),
];

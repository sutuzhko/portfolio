import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config';

import type { AuthUser, ChangePassword, LoginCredentials } from '../model/types';

/** Мок-пользователь приватной зоны (роль ADMIN). */
export const mockAuthUser: AuthUser = {
  id: '00000000-0000-4000-8000-000000000001',
  username: 'admin',
  role: 'ADMIN',
};

/** Логин мока — совпадает с сидом бэкенда (admin). Пароль изменяем — см. `currentPassword`. */
const USERNAME = 'admin';
const INITIAL_PASSWORD = 'admin12345';
// Текущий пароль мока: смена пароля его меняет, поэтому dev:mock ведёт себя как бэк.
let currentPassword = INITIAL_PASSWORD;

// Мок различает два «токена», как реальный бэкенд:
//   - `session` (модульная переменная) = короткоживущий access: сбрасывается при
//     перезагрузке страницы, как истёкшая access-cookie;
//   - маркер в localStorage = долгоживущий refresh: переживает перезагрузку.
// Благодаря этому в dev:mock работает тот же сценарий, что в проде: после reload
// `/auth/me` даёт 401, baseQuery дёргает `/auth/refresh`, сессия восстанавливается.
const REFRESH_KEY = 'mock_refresh_token';
let session: AuthUser | null = null;

function hasRefreshToken(): boolean {
  try {
    return localStorage.getItem(REFRESH_KEY) !== null;
  } catch {
    return false;
  }
}

function setRefreshToken(value: boolean): void {
  try {
    if (value) localStorage.setItem(REFRESH_KEY, '1');
    else localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* localStorage недоступен — работаем только с in-memory сессией */
  }
}

/** Сбрасывает сессию и пароль мока — для изоляции тестов. */
export function resetMockSession(): void {
  session = null;
  currentPassword = INITIAL_PASSWORD;
  setRefreshToken(false);
}

/** MSW-обработчики аутентификации: stateful login/me/refresh/logout/change-password. */
export const sessionHandlers = [
  http.post<Record<string, never>, LoginCredentials>(
    `${env.apiBaseUrl}/auth/login`,
    async ({ request }) => {
      const { username, password } = await request.json();
      if (username === USERNAME && password === currentPassword) {
        session = mockAuthUser;
        setRefreshToken(true);
        return HttpResponse.json(mockAuthUser);
      }
      return new HttpResponse(null, { status: 401 });
    },
  ),
  http.get(`${env.apiBaseUrl}/auth/me`, () =>
    session ? HttpResponse.json(session) : new HttpResponse(null, { status: 401 }),
  ),
  // Продление сессии по «refresh-токену»: восстанавливает access, если refresh жив.
  http.post(`${env.apiBaseUrl}/auth/refresh`, () => {
    if (!hasRefreshToken()) {
      return new HttpResponse(null, { status: 401 });
    }
    session = mockAuthUser;
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(`${env.apiBaseUrl}/auth/logout`, () => {
    session = null;
    setRefreshToken(false);
    return new HttpResponse(null, { status: 204 });
  }),
  http.post<Record<string, never>, ChangePassword>(
    `${env.apiBaseUrl}/auth/change-password`,
    async ({ request }) => {
      if (!session) return new HttpResponse(null, { status: 401 });
      const { currentPassword: current, newPassword } = await request.json();
      if (current !== currentPassword) return new HttpResponse(null, { status: 401 });
      currentPassword = newPassword;
      return new HttpResponse(null, { status: 204 });
    },
  ),
];

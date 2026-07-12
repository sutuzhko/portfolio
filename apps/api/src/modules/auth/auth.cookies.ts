import type { Request } from 'express';

// Имена cookie с токенами. Доступ — на всё API, refresh — только на эндпоинты авторизации.
export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

// Путь ограничивает отправку refresh-cookie только на /api/auth/* (учитывает глобальный префикс).
export const REFRESH_COOKIE_PATH = '/api/auth';

// Достаёт значение cookie, не завязываясь на нетипизированный `any` из cookie-parser.
export function readCookie(request: Request, name: string): string | undefined {
  const cookies: Record<string, string> = request.cookies ?? {};
  return cookies[name];
}

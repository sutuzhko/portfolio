import { applyDecorators, createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';

import { DEFAULT_LOCALE, LOCALES, type Locale } from './locale.types';

// Извлекает локаль из первого языкового тега заголовка Accept-Language
// (`en-US,en;q=0.9` → `en`), если он входит в список поддерживаемых.
function localeFromHeader(header: string | undefined): Locale | undefined {
  const tag = header?.split(',')[0]?.split(';')[0]?.split('-')[0]?.trim().toLowerCase();
  return LOCALES.includes(tag as Locale) ? (tag as Locale) : undefined;
}

// Определяет локаль ответа: приоритет у явного `?locale=`, затем заголовок
// `Accept-Language` (его шлёт фронтенд через withLocale), иначе — ru по умолчанию.
export const CurrentLocale = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Locale => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const fromQuery = request.query?.locale;
    if (LOCALES.includes(fromQuery as Locale)) return fromQuery as Locale;
    return localeFromHeader(request.headers['accept-language']) ?? DEFAULT_LOCALE;
  },
);

// Документирует необязательный query-параметр ?locale= в Swagger.
export const ApiLocaleQuery = (): ReturnType<typeof applyDecorators> =>
  applyDecorators(ApiQuery({ name: 'locale', enum: LOCALES, required: false }));

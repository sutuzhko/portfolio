import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

// Композитный декоратор для admin-эндпоинтов приватной зоны: логин + роль ADMIN
// + документация ответов 401/403. Модуль-потребитель должен импортировать AuthModule.
export function AdminAuth(): ReturnType<typeof applyDecorators> {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.ADMIN),
    ApiCookieAuth(),
    ApiUnauthorizedResponse({ description: 'Требуется авторизация' }),
    ApiForbiddenResponse({ description: 'Недостаточно прав' }),
  );
}

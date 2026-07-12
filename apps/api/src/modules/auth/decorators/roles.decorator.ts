import { SetMetadata } from '@nestjs/common';
import type { CustomDecorator } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

// Ограничивает доступ к роуту перечисленными ролями (проверяется RolesGuard).
export const Roles = (...roles: UserRole[]): CustomDecorator => SetMetadata(ROLES_KEY, roles);

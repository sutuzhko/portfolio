import { UserRole } from '@prisma/client';

// Полезная нагрузка JWT. `sub` — id пользователя (стандартное claim-имя).
export interface JwtPayload {
  readonly sub: string;
  readonly username: string;
  readonly role: UserRole;
}

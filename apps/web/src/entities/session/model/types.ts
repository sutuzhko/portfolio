import type { components } from '@portfolio/contract';

/** Аутентифицированный пользователь (ответ `/auth/me` и `/auth/login`). */
export type AuthUser = components['schemas']['AuthUserDto'];

/** Учётные данные для входа. */
export type LoginCredentials = components['schemas']['LoginDto'];

/** Роль пользователя. */
export type UserRole = components['schemas']['UserRole'];

/** Тело смены пароля администратора. */
export type ChangePassword = components['schemas']['ChangePasswordDto'];

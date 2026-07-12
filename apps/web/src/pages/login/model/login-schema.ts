import type { TFunction } from 'i18next';
import { z } from 'zod';

/**
 * Схема формы входа. Сообщения локализуются, поэтому схема — фабрика от `t`:
 * компонент собирает её на текущем языке. Форма совпадает по форме с `LoginDto`.
 */
export function createLoginSchema(t: TFunction) {
  return z.object({
    username: z.string().trim().min(1, t('login.required.username')),
    password: z.string().min(1, t('login.required.password')),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

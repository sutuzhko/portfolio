import type { ProfileContact } from './types';

/**
 * @-ник из Telegram-контакта профиля (`https://t.me/sutuzhko` → `@sutuzhko`).
 * Ник владельца — данные с бэкенда (`profile.contacts`), а не хардкод/i18n.
 * Возвращает `undefined`, если Telegram-контакта нет или ссылка нераспознаваема.
 */
export function telegramHandle(
  contacts: readonly ProfileContact[] | undefined,
): string | undefined {
  const telegram = contacts?.find((contact) => contact.icon === 'telegram');
  if (telegram === undefined) return undefined;
  try {
    const segment = new URL(telegram.url).pathname.replace(/\//g, '');
    return segment ? `@${segment}` : undefined;
  } catch {
    return undefined;
  }
}

import { telegramHandle, type ProfileContact } from '@/entities/profile';

export interface TelegramContact {
  readonly url: string;
  /** @-ник, выведённый из ссылки `t.me/<ник>` (данные владельца — с бэкенда). */
  readonly handle: string;
}

/**
 * Достаёт Telegram-контакт из профиля для подсказки «нет доступа?». Ник владельца
 * приходит с бэкенда (`profile.contacts`), а не из i18n — по правилу «любые данные
 * пользователя только с сервера». Извлечение ника — общий `telegramHandle`.
 */
export function findTelegramContact(
  contacts: readonly ProfileContact[] | undefined,
): TelegramContact | undefined {
  const telegram = contacts?.find((contact) => contact.icon === 'telegram');
  if (telegram === undefined) return undefined;
  return { url: telegram.url, handle: telegramHandle(contacts) ?? telegram.url };
}

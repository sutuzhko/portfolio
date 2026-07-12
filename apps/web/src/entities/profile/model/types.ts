import type { components } from '@portfolio/contract';

/** Публичный профиль владельца портфолио (локализованный ответ API). */
export type Profile = components['schemas']['ProfileDto'];

/** Статус доступности к работе. */
export type AvailabilityStatus = components['schemas']['AvailabilityStatus'];

/** Ссылка-контакт профиля (Telegram, email, GitHub…). */
export type ProfileContact = components['schemas']['ProfileContactDto'];

/** Профиль в админ-виде: обе локали для редактирования. */
export type ProfileAdmin = components['schemas']['ProfileAdminDto'];

/** Тело PATCH профиля (частичное обновление). */
export type UpdateProfile = components['schemas']['UpdateProfileDto'];

/** Результат загрузки аватара: URL сохранённого изображения. */
export type AvatarResult = components['schemas']['AvatarResultDto'];

/** Параметры кадрирования аватара — квадрат в пикселях исходного изображения. */
export interface AvatarCrop {
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

/** Результат загрузки PDF-резюме: URL сохранённого файла. */
export type CvResult = components['schemas']['CvResultDto'];

/** Контакт-ссылка профиля в админ-виде (id + icon + url + флаги). */
export type AdminContactLink = components['schemas']['AdminContactLinkDto'];

/** Тело создания контакта. */
export type CreateContact = components['schemas']['CreateContactLinkDto'];

/** Тело обновления контакта. */
export type UpdateContact = components['schemas']['UpdateContactLinkDto'];

/** Локализованный текст `{ ru, en? }` (ответ). */
export type LocalizedText = components['schemas']['LocalizedTextDto'];

/** Локализованный ввод `{ ru, en? }` (запрос). */
export type LocalizedTextInput = components['schemas']['LocalizedTextInput'];

/** Показатель профиля в админ-вводе: значение + локализованная подпись. */
export type ProfileHighlightInput = components['schemas']['ProfileHighlightInput'];

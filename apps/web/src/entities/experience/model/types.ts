import type { components } from '@portfolio/contract';

/** Место работы (локализованный ответ `GET /api/experience`). */
export type Experience = components['schemas']['ExperienceDto'];

/** Место работы в админ-виде: обе локали + связи по id. */
export type ExperienceAdmin = components['schemas']['ExperienceAdminDto'];

/** Тело создания места работы. */
export type CreateExperience = components['schemas']['CreateExperienceDto'];

/** Тело обновления места работы (частичное, мёрж локали на бэке). */
export type UpdateExperience = components['schemas']['UpdateExperienceDto'];

import type { components } from '@portfolio/contract';

/** Технология стека (локализованный ответ `GET /api/technologies`). */
export type Technology = components['schemas']['TechnologyDto'];

/** Технология в админ-виде (с порядком). */
export type TechnologyAdmin = components['schemas']['TechnologyAdminDto'];

/** Тело создания технологии. */
export type CreateTechnology = components['schemas']['CreateTechnologyDto'];

/** Тело обновления технологии (частичное). */
export type UpdateTechnology = components['schemas']['UpdateTechnologyDto'];

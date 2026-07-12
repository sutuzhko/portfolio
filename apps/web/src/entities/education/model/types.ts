import type { components } from '@portfolio/contract';

/** Запись образования (локализованный ответ `GET /api/education`). */
export type Education = components['schemas']['EducationDto'];

/** Запись образования в админ-виде: обе локали для редактирования. */
export type EducationAdmin = components['schemas']['EducationAdminDto'];

/** Тело создания записи образования. */
export type CreateEducation = components['schemas']['CreateEducationDto'];

/** Тело обновления записи образования (частичное, мёрж локали на бэке). */
export type UpdateEducation = components['schemas']['UpdateEducationDto'];

/** Тип записи: основное образование (`MAIN`) или курс/сертификат (`ADDITIONAL`). */
export type EducationType = components['schemas']['EducationType'];

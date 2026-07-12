import type { components } from '@portfolio/contract';

/** Контрибьютор в админ-виде (имя в обеих локалях) — для мультиселекта в проектах. */
export type ContributorAdmin = components['schemas']['ContributorAdminDto'];

/** Тело создания контрибьютора (имя обязательно, остальное опционально). */
export type CreateContributor = components['schemas']['CreateContributorDto'];

/** Тело правки контрибьютора (частичное — правится активная локаль имени + цвет/ссылка). */
export type UpdateContributor = components['schemas']['UpdateContributorDto'];

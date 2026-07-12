import type { components } from '@portfolio/contract';

/** Навык (локализованный ответ `GET /api/skills`). */
export type Skill = components['schemas']['SkillDto'];

/** Навык в админ-виде (имя в обеих локалях) — для редактора в «Стеке». */
export type SkillAdmin = components['schemas']['SkillAdminDto'];

/** Тело создания навыка. */
export type CreateSkill = components['schemas']['CreateSkillDto'];

/** Тело правки навыка. */
export type UpdateSkill = components['schemas']['UpdateSkillDto'];

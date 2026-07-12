import { describe, expect, it } from 'vitest';

import type { EducationAdmin } from '@/entities/education';
import { mockEducationAdmin } from '@/entities/education/mocks';
import type { ExperienceAdmin } from '@/entities/experience';
import { mockExperienceAdmin } from '@/entities/experience/mocks';
import type { ProfileAdmin } from '@/entities/profile';
import { mockProfileAdmin } from '@/entities/profile/mocks';
import type { ProjectAdmin } from '@/entities/project';
import { mockProjectsAdmin } from '@/entities/project/mocks';

import type { LocEdits } from './loc-rows';
import { buildLocRows, buildSaves, type LocData } from './loc-sources';

const labels = {
  profile: 'Профиль',
  projectPrefix: 'Проект',
  experiencePrefix: 'Опыт',
  education: 'Образование',
};

// Фикстуры на базе моков сущностей (полные типы) с контролируемыми значениями.
const baseProject = mockProjectsAdmin[0];
const baseExperience = mockExperienceAdmin[0];
const baseEducation = mockEducationAdmin[0];

if (!baseProject || !baseExperience || !baseEducation) {
  throw new Error('Ожидались моки admin-сущностей для теста');
}

const project: ProjectAdmin = {
  ...baseProject,
  id: 'p1',
  slug: 'alpha',
  title: { ru: 'Альфа', en: 'Alpha' },
  role: null, // null-поле не даёт строку
  runHint: null,
};

const experience: ExperienceAdmin = {
  ...baseExperience,
  id: 'e1',
  company: 'Точка',
  role: { ru: 'Разработчик', en: '' }, // нет EN
  location: null,
  sub: null,
};

const education: EducationAdmin = {
  ...baseEducation,
  id: 'ed1',
  degree: { ru: 'Бакалавр', en: 'Бакалавр' }, // EN == RU
  place: null,
};

const profile: ProfileAdmin = {
  ...mockProfileAdmin,
  name: { ru: 'Богдан', en: 'Bogdan' },
  projectsIntro: null,
  experienceIntro: null,
  contactIntro: null,
};

const data: LocData = {
  profile,
  projects: [project],
  experiences: [experience],
  educations: [education],
};

describe('loc-sources: buildLocRows', () => {
  it('разворачивает сущности в плоские строки, пропуская пустые поля', () => {
    const rows = buildLocRows(data, labels);
    const byId = new Map(rows.map((r) => [r.id, r]));

    // profile.role=null пропущен у проекта; project.title даёт строку.
    const title = byId.get('project:p1:title');
    expect(title).toMatchObject({
      sectionLabel: 'Проект · Альфа',
      label: 'project.alpha.title',
      ru: 'Альфа',
      en: 'Alpha',
    });

    // Пустые/null поля не создают строк.
    expect(byId.has('project:p1:role')).toBe(false);
    expect(byId.has('experience:e1:location')).toBe(false);
    expect(byId.has('education:ed1:place')).toBe(false);

    // en отсутствует → пустая строка (не undefined).
    expect(byId.get('experience:e1:role')?.en).toBe('');

    // profile.name присутствует, отключённые интро — нет.
    expect(byId.get('profile:profile:name')?.sectionLabel).toBe('Профиль');
    expect(byId.has('profile:profile:projectsIntro')).toBe(false);
  });

  it('образование группируется в одну секцию, опыт/проекты — по сущности', () => {
    const rows = buildLocRows(data, labels);
    expect(rows.find((r) => r.id === 'education:ed1:degree')?.sectionId).toBe('education');
    expect(rows.find((r) => r.id === 'experience:e1:role')?.sectionId).toBe('experience:e1');
  });
});

describe('loc-sources: buildSaves', () => {
  it('группирует правки по сущности и шлёт обе локали', () => {
    const rows = buildLocRows(data, labels);
    const edits: LocEdits = {
      'project:p1:title': { ru: 'Альфа', en: 'Alpha 2' }, // изменён EN
      'project:p1:description': {
        ru: byRow(rows, 'project:p1:description').ru,
        en: 'New description',
      },
      'profile:profile:name': { ru: 'Богдан', en: 'Bogdan' }, // не изменён — не в саве
    };

    const saves = buildSaves(rows, edits);
    // Профиль без реальных изменений не попадает; проект — один сейв с двумя полями.
    expect(saves).toHaveLength(1);
    const [save] = saves;
    expect(save).toMatchObject({ sourceId: 'project', entityId: 'p1' });
    expect(save?.body.title).toEqual({ ru: 'Альфа', en: 'Alpha 2' });
    expect(save?.body.description?.en).toBe('New description');
  });

  it('без правок — пустой список', () => {
    const rows = buildLocRows(data, labels);
    expect(buildSaves(rows, {})).toEqual([]);
  });
});

function byRow(rows: ReturnType<typeof buildLocRows>, id: string): { ru: string; en: string } {
  const row = rows.find((r) => r.id === id);
  if (!row) throw new Error(`Нет строки ${id}`);
  return { ru: row.ru, en: row.en };
}

import type { ProjectListItem } from '@/entities/project';

/** Уникальные технологии всех проектов (для чипов фильтра), в порядке появления. */
export function collectTechOptions(projects: readonly ProjectListItem[]): readonly string[] {
  const seen = new Set<string>();
  for (const project of projects) {
    for (const tech of project.technologies) {
      seen.add(tech);
    }
  }
  return [...seen];
}

/** Уникальные имена контрибьюторов всех проектов, в порядке появления. */
export function collectContributorOptions(projects: readonly ProjectListItem[]): readonly string[] {
  const seen = new Set<string>();
  for (const project of projects) {
    for (const contributor of project.contributors) {
      seen.add(contributor.name);
    }
  }
  return [...seen];
}

import type { Technology } from '@/entities/technology';

export interface StackGroup {
  /** Название слоя стека (Frontend / Backend / Tooling). */
  readonly group: string;
  /** Технологии слоя. */
  readonly items: readonly string[];
}

/**
 * Группирует технологии по категории. Порядок групп — по первому появлению
 * категории; технологии без категории пропускаются.
 */
export function groupTechnologies(technologies: readonly Technology[]): StackGroup[] {
  const groups = new Map<string, string[]>();
  for (const tech of technologies) {
    if (tech.category === null || tech.category === '') {
      continue;
    }
    const items = groups.get(tech.category) ?? [];
    items.push(tech.name);
    groups.set(tech.category, items);
  }
  return [...groups.entries()].map(([group, items]) => ({ group, items }));
}

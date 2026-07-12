import type { ContributorAdmin } from '@/entities/contributor';
import type { TechnologyAdmin } from '@/entities/technology';
import type { AppLanguage } from '@/shared/config';
import type { ProjectTileData } from '@/entities/project';

import { pickText, type ProjectFormValues } from './project-form';

interface PreviewFallbacks {
  /** Что показать вместо пустого названия, пока его не ввели. */
  readonly title: string;
  /** Что показать вместо пустого краткого описания. */
  readonly description: string;
}

/**
 * Собирает данные плитки из живого черновика формы: id технологий и коллабораторов
 * разрешаются в их названия по каталогам, пустые поля подменяются заглушками.
 *
 * Вынесено в модель, чтобы соответствие «поле формы → плитка» можно было проверить
 * тестом, не рендеря форму целиком.
 */
export function formToTile(
  values: ProjectFormValues,
  technologies: readonly TechnologyAdmin[],
  contributors: readonly ContributorAdmin[],
  locale: AppLanguage,
  fallbacks: PreviewFallbacks,
): ProjectTileData {
  const technologyNames = values.technologyIds
    .map((id) => technologies.find((technology) => technology.id === id)?.name)
    .filter((name): name is string => name !== undefined);

  const people = values.contributorIds
    .map((id) => contributors.find((contributor) => contributor.id === id))
    .filter((contributor): contributor is ContributorAdmin => contributor !== undefined)
    .map((contributor) => ({
      name: pickText(contributor.name, locale),
      image: contributor.image,
      color: contributor.color,
    }));

  const trimmedTitle = values.title.trim();
  const trimmedDescription = values.description.trim();

  return {
    title: trimmedTitle.length > 0 ? trimmedTitle : fallbacks.title,
    description: trimmedDescription.length > 0 ? trimmedDescription : fallbacks.description,
    category: values.category.trim() || null,
    period: values.period.trim() || null,
    tileColor: values.tileColor,
    runnable: values.runnable,
    runCommand: values.runCommand.trim() || null,
    contributors: people,
    technologies: technologyNames,
  };
}

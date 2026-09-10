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
  // Порядок — каталожный (глобальный `order`), а не порядок кликов: в нём же технологии
  // и участники идут на публичной плитке, поэтому превью совпадает с сайтом.
  const technologyNames = technologies
    .filter((technology) => values.technologyIds.includes(technology.id))
    .map((technology) => technology.name);

  const people = contributors
    .filter((contributor) => values.contributorIds.includes(contributor.id))
    .map((contributor) => ({
      name: pickText(contributor.name, locale),
      image: contributor.image,
      color: contributor.color,
      link: contributor.link,
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

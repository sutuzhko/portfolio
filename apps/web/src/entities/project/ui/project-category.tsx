import { useTranslation } from 'react-i18next';

import styles from './project-tile.module.css';

interface ProjectCategoryProps {
  readonly category: string;
}

/** Бейдж категории проекта на карточке (локализован; сырое значение — фолбэк). */
export function ProjectCategory({ category }: ProjectCategoryProps) {
  const { t } = useTranslation();

  return <span className={styles.category}>{t(`projects.categories.${category}`, category)}</span>;
}

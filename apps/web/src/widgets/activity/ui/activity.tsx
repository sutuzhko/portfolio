import { useTranslation } from 'react-i18next';

import type { CodewarsStats, GithubStats } from '@/entities/stats';
import { cn } from '@/shared/lib';
import { SectionLabel } from '@sutuzhko/ui-kit';

import { CodewarsCard } from './codewars-card';
import { GithubCard } from './github-card';
import styles from './activity.module.css';

export interface ActivityProps {
  readonly github?: GithubStats;
  readonly githubError?: boolean;
  readonly codewars?: CodewarsStats;
  readonly codewarsError?: boolean;
  /** Якорь секции для навигации и скролл-шпиона. */
  readonly id?: string;
  readonly className?: string;
}

/**
 * Секция активности главной (макет: STATS) — карточки GitHub и Codewars из
 * прокси-эндпоинтов статистики. Презентационна: данные/ошибки приходят пропсами
 * (страница оркестрирует запросы). Каждая карточка независимо грузится
 * (скелетон, пока нет данных) и деградирует при недоступности сервиса.
 */
export function Activity({
  github,
  githubError,
  codewars,
  codewarsError,
  id,
  className,
}: ActivityProps) {
  const { t } = useTranslation();

  return (
    <section id={id} className={cn(styles.section, className)}>
      <SectionLabel>{t('home.sections.activity')}</SectionLabel>
      <div className={styles.grid}>
        <GithubCard data={github} isError={githubError} />
        <CodewarsCard data={codewars} isError={codewarsError} />
      </div>
    </section>
  );
}

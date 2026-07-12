import { useTranslation } from 'react-i18next';

import { Icon } from '@sutuzhko/ui-kit';

import type { ProjectFilter } from '../model/use-project-filter';

import { FilterRow, FilterRowSkeleton } from './filter-row';
import styles from './project-filter-bar.module.css';

interface ProjectFilterBarProps {
  readonly filter: ProjectFilter;
  /** Пока проекты грузятся — фасеты показывают скелетон-чипы. */
  readonly isLoading?: boolean;
}

/**
 * Панель поиска и фильтров списка проектов: строка поиска (по названию/описанию)
 * и фасеты технологий/контрибьюторов на переключаемых чипах. Управляемая —
 * состояние живёт в контроллере `useProjectFilter`. Фасет без опций не рендерим.
 */
export function ProjectFilterBar({ filter, isLoading }: ProjectFilterBarProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.bar}>
      <div className={styles.search}>
        <Icon name="search" size={16} className={styles.searchIcon} />
        <input
          type="search"
          className={styles.input}
          value={filter.state.query}
          onChange={(event) => {
            filter.setQuery(event.target.value);
          }}
          placeholder={t('projects.filter.searchPlaceholder')}
          aria-label={t('projects.filter.searchPlaceholder')}
        />
        {filter.hasFilters ? (
          <button type="button" className={styles.reset} onClick={filter.clear}>
            {t('projects.filter.reset')}
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <>
          <FilterRowSkeleton label={t('projects.filter.tech')} />
          <FilterRowSkeleton label={t('projects.filter.contributors')} />
        </>
      ) : (
        <>
          {filter.techOptions.length > 0 ? (
            <FilterRow
              label={t('projects.filter.tech')}
              options={filter.techOptions}
              selected={filter.state.techs}
              onToggle={filter.toggleTech}
            />
          ) : null}
          {filter.contributorOptions.length > 0 ? (
            <FilterRow
              label={t('projects.filter.contributors')}
              options={filter.contributorOptions}
              selected={filter.state.contributors}
              onToggle={filter.toggleContributor}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

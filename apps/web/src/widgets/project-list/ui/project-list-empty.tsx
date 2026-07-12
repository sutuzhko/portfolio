import { useTranslation } from 'react-i18next';

import styles from './project-list.module.css';

interface ProjectListEmptyProps {
  readonly onClear: () => void;
}

/** Пустое состояние сетки: фильтры не дали результатов + сброс фильтров. */
export function ProjectListEmpty({ onClear }: ProjectListEmptyProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.empty} role="status">
      <span className={styles.emptyMarker}>{t('projects.empty.marker')}</span>
      <p className={styles.emptyTitle}>{t('projects.empty.title')}</p>
      <p className={styles.emptyDesc}>{t('projects.empty.description')}</p>
      <button type="button" className={styles.emptyButton} onClick={onClear}>
        {t('projects.empty.button')}
      </button>
    </div>
  );
}

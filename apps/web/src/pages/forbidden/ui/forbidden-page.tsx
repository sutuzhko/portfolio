import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { routePaths } from '@/shared/config';

import styles from './forbidden-page.module.css';

/** Страница 403 — нет прав доступа (используется гардами приватной зоны). */
export function ForbiddenPage() {
  const { t } = useTranslation();

  return (
    <main className={styles.page}>
      <p className={styles.code}>{t('forbidden.code')}</p>
      <h1 className={styles.title}>{t('forbidden.title')}</h1>
      <p className={styles.description}>{t('forbidden.description')}</p>
      <Link className={styles.link} to={routePaths.home}>
        {t('forbidden.back')}
      </Link>
    </main>
  );
}

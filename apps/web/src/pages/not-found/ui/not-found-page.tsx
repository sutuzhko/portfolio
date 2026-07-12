import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { routePaths } from '@/shared/config';

import styles from './not-found-page.module.css';

/** Страница 404. */
export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <main className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>{t('notFound.title')}</h1>
      <p className={styles.description}>{t('notFound.description')}</p>
      <Link className={styles.link} to={routePaths.home}>
        {t('notFound.back')}
      </Link>
    </main>
  );
}

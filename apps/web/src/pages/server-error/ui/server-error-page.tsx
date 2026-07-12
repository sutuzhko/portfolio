import { useTranslation } from 'react-i18next';

import { routePaths } from '@/shared/config';

import styles from './server-error-page.module.css';

/**
 * Страница 500 — используется как `errorElement` роутера (ошибка рендера/лоадера
 * маршрута). Ссылка «на главную» — обычная `<a>`: полная перезагрузка сбрасывает
 * ошибочное состояние роутера.
 */
export function ServerErrorPage() {
  const { t } = useTranslation();

  return (
    <main className={styles.page}>
      <p className={styles.code}>{t('serverError.code')}</p>
      <h1 className={styles.title}>{t('serverError.title')}</h1>
      <p className={styles.description}>{t('serverError.description')}</p>
      <a className={styles.link} href={routePaths.home}>
        {t('serverError.back')}
      </a>
    </main>
  );
}

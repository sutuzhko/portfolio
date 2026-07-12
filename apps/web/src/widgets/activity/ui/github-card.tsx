import { useTranslation } from 'react-i18next';

import type { GithubStats } from '@/entities/stats';
import { Card, Icon, Tag } from '@sutuzhko/ui-kit';

import { useNumberFormat } from '../model/use-number-format';

import { StatCardError } from './stat-card-error';
import { StatCardSkeleton } from './stat-card-skeleton';
import { StatItem } from './stat-item';
import styles from './activity.module.css';

interface GithubCardProps {
  readonly data?: GithubStats;
  readonly isError?: boolean;
}

/**
 * Карточка GitHub: бренд, счётчики репозиториев/подписчиков/подписок и топ языков.
 * Независимо грузится (скелетон) и деградирует до фолбэка при недоступности сервиса.
 */
export function GithubCard({ data, isError }: GithubCardProps) {
  const { t } = useTranslation();
  const format = useNumberFormat();

  if (isError) return <StatCardError label={t('home.activity.unavailable')} />;
  if (!data) return <StatCardSkeleton />;

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.badge}>
            <Icon name="github" size={20} />
          </span>
          <div className={styles.brandText}>
            <p className={styles.brandName}>GitHub</p>
            <p className={styles.handle}>{data.handle}</p>
          </div>
        </div>
        <a className={styles.profileLink} href={data.url} target="_blank" rel="noopener noreferrer">
          {t('home.activity.profile')}
        </a>
      </div>
      <div className={styles.stats}>
        <StatItem value={format(data.repos)} label={t('home.activity.github.repos')} />
        <StatItem value={format(data.followers)} label={t('home.activity.github.followers')} />
        <StatItem value={format(data.following)} label={t('home.activity.github.following')} />
      </div>
      <div className={styles.stack}>
        <p className={styles.stackLabel}>{t('home.activity.github.stackLabel')}</p>
        <div className={styles.tags}>
          {data.topLanguages.map((lang) => (
            <Tag key={lang}>{lang}</Tag>
          ))}
        </div>
      </div>
    </Card>
  );
}

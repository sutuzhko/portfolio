import { useTranslation } from 'react-i18next';

import type { CodewarsStats } from '@/entities/stats';
import { Card, Icon } from '@sutuzhko/ui-kit';

import { kyuColor } from '../model/config';
import { useNumberFormat } from '../model/use-number-format';

import { StatCardError } from './stat-card-error';
import { StatCardSkeleton } from './stat-card-skeleton';
import { StatItem } from './stat-item';
import styles from './activity.module.css';

interface CodewarsCardProps {
  readonly data?: CodewarsStats;
  readonly isError?: boolean;
}

/**
 * Карточка Codewars: бренд, бейдж ранга (kyu), метрики чести/ката/лидерборда и
 * прогресс до следующего ранга. Цвет ранга — по официальной палитре (`kyuColor`).
 */
export function CodewarsCard({ data, isError }: CodewarsCardProps) {
  const { t } = useTranslation();
  const format = useNumberFormat();

  if (isError) return <StatCardError label={t('home.activity.unavailable')} />;
  if (!data) return <StatCardSkeleton />;

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.badge}>
            <Icon name="codewars" size={22} />
          </span>
          <div className={styles.brandText}>
            <p className={styles.brandName}>Codewars</p>
            <p className={styles.handle}>codewars.com/{data.handle}</p>
          </div>
        </div>
        <span className={styles.kyu} style={{ color: kyuColor(data.kyu) }}>
          <svg className={styles.kyuHex} viewBox="0 0 94 56" aria-hidden="true">
            <polygon
              points="24,3 70,3 91,28 70,53 24,53 3,28"
              fill="currentColor"
              fillOpacity="0.12"
              stroke="currentColor"
              strokeWidth="2.5"
            />
          </svg>
          <span className={styles.kyuLabel}>{data.rankName}</span>
        </span>
      </div>
      <div className={styles.stats}>
        <StatItem value={format(data.honor)} label={t('home.activity.codewars.honor')} />
        <StatItem value={format(data.katas)} label={t('home.activity.codewars.katas')} />
        <StatItem
          value={format(data.leaderboardPosition)}
          label={t('home.activity.codewars.leaderboard')}
        />
      </div>
      {data.nextKyu !== null ? (
        <div className={styles.progress}>
          <div className={styles.progressHead}>
            <span className={styles.progressLabel}>
              {t('home.activity.codewars.next', { kyu: data.nextKyu })}
            </span>
            <span className={styles.progressValue} style={{ color: kyuColor(data.kyu) }}>
              {data.progress}%
            </span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${String(data.progress)}%`, backgroundColor: kyuColor(data.kyu) }}
            />
          </div>
        </div>
      ) : null}
    </Card>
  );
}

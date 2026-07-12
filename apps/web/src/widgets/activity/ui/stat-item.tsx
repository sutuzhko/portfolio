import styles from './activity.module.css';

interface StatItemProps {
  readonly value: string;
  readonly label: string;
}

/** Одна метрика карточки: крупное значение и подпись под ним. */
export function StatItem({ value, label }: StatItemProps) {
  return (
    <div className={styles.stat}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

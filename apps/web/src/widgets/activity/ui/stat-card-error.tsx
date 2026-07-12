import { cn } from '@/shared/lib';
import { Card } from '@sutuzhko/ui-kit';

import styles from './activity.module.css';

interface StatCardErrorProps {
  readonly label: string;
}

/** Фолбэк карточки, когда сервис статистики недоступен: деградируем, а не прячем блок. */
export function StatCardError({ label }: StatCardErrorProps) {
  return (
    <Card className={cn(styles.card, styles.cardError)} role="status">
      <span className={styles.errorText}>{label}</span>
    </Card>
  );
}

import { cn } from '@/shared/lib';
import { Card, Skeleton, Text } from '@sutuzhko/ui-kit';

import styles from './highlights.module.css';

/** Показатель к отображению: крупное значение и готовая подпись. */
export interface HighlightItem {
  readonly value: string;
  readonly label: string;
}

const SKELETON_COUNT = 4;

export interface HighlightsProps {
  /** Показатели (значение + подпись) из профиля. Пока не пришли — скелетон. */
  readonly items?: readonly HighlightItem[];
  readonly isLoading?: boolean;
  readonly className?: string;
}

/**
 * Секция ключевых показателей главной (макет: HIGHLIGHTS) — ряд карточек
 * «крупное значение + подпись». Заголовка секции нет намеренно: блок идёт сразу
 * за геро-полосой. Данные приходят с бэкенда (`profile.highlights`), пока
 * грузятся — скелетон повторяет раскладку карточек.
 */
export function Highlights({ items, isLoading, className }: HighlightsProps) {
  if (isLoading || !items) {
    return (
      <ul className={cn(styles.grid, className)} aria-busy="true" aria-live="polite">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li key={index} className={styles.item}>
            <Card className={styles.card}>
              <Skeleton width="52px" height="25px" />
              <Skeleton width="80%" height="16px" />
            </Card>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={cn(styles.grid, className)}>
      {items.map((highlight) => (
        <li key={`${highlight.value}|${highlight.label}`} className={styles.item}>
          <Card className={styles.card}>
            <div className={styles.value}>{highlight.value}</div>
            <Text as="span" size="small" tone="muted">
              {highlight.label}
            </Text>
          </Card>
        </li>
      ))}
    </ul>
  );
}

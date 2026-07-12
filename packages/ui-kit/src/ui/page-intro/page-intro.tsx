import { cn } from '../../lib';
import { Skeleton } from '../skeleton/skeleton';
import { Text } from '../text';

import styles from './page-intro.module.css';

export interface PageIntroProps {
  /**
   * Текст интро с бэкенда. `undefined` — ещё грузится (скелетон),
   * `null` — интро нет (ничего не рендерим), строка — показываем абзац.
   */
  readonly intro?: string | null;
  readonly className?: string;
}

/**
 * Интро-абзац под заголовком экрана (Projects/Experience/Contact). Текст —
 * серверное поле профиля, поэтому пока грузится, вместо него скелетон из двух
 * строк, повторяющий высоту абзаца (без скачка вёрстки). Собран из UI Kit
 * (`Text` + `Skeleton`).
 */
export function PageIntro({ intro, className }: PageIntroProps) {
  if (intro === null) return null;

  if (intro === undefined) {
    return (
      <div className={cn(styles.skeleton, className)} aria-busy="true" aria-live="polite">
        <Skeleton height="var(--page-intro-line)" />
        <Skeleton height="var(--page-intro-line)" width="70%" />
      </div>
    );
  }

  return (
    <Text tone="muted" className={cn(styles.text, className)}>
      {intro}
    </Text>
  );
}

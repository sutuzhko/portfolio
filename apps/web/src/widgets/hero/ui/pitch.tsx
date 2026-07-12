import { cn } from '@/shared/lib';
import { Skeleton, Text } from '@sutuzhko/ui-kit';

import styles from './hero.module.css';

/** Питч героя — данные профиля (`profile.headline`, локализовано бэкендом).
 * Длинное «обо мне» (`bioMarkdown`) живёт в отдельной секции About. */
export function Pitch({ text }: { readonly text: string }) {
  return (
    <div className={styles.pitch}>
      <Text tone="muted">{text}</Text>
    </div>
  );
}

/** Скелетон питча: три строки-заглушки ≈ высота абзаца питча (3 строки body). */
export function PitchSkeleton() {
  return (
    <div className={cn(styles.pitch, styles.pitchSkeleton)}>
      <Skeleton width="100%" height="17px" />
      <Skeleton width="92%" height="17px" />
      <Skeleton width="58%" height="17px" />
    </div>
  );
}

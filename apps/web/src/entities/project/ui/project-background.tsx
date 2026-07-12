import { cn } from '@/shared/lib';

import styles from './project-background.module.css';

interface ProjectBackgroundProps {
  /** Заливка плитки: CSS-градиент или цвет. По умолчанию — нейтральный фон. */
  readonly color?: string | null;
  readonly className?: string;
}

/**
 * Декоративный фон плитки проекта: заливка (`tileColor`) плюс фирменная текстура —
 * диагональная штриховка, «орб» в углу и затемняющий градиент. Вынесен отдельным
 * компонентом, чтобы переиспользовать (карточка списка, будущая шапка детали,
 * выбор фона в CMS) и покрывать историями независимо. Полностью декоративен —
 * позиционируется абсолютно внутри relative-родителя и скрыт от screen reader.
 */
export function ProjectBackground({ color, className }: ProjectBackgroundProps) {
  return (
    <span
      className={cn(styles.background, className)}
      style={{ background: color ?? 'var(--color-raised)' }}
      aria-hidden="true"
    >
      <span className={styles.stripes} />
      <span className={styles.orb} />
      <span className={styles.shade} />
    </span>
  );
}

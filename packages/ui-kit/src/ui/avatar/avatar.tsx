import type { CSSProperties } from 'react';

import { cn, initials } from '../../lib';

import styles from './avatar.module.css';

export interface AvatarProps {
  /** Имя — источник инициалов и доступной подписи. */
  readonly name: string;
  readonly src?: string | null;
  /** Размер квадрата в px. По умолчанию 40. */
  readonly size?: number;
  /** Сплошной цвет фона (для контрибьюторов). Без него — зелёный градиент. */
  readonly color?: string | null;
  /** Форма: `circle` (по умолчанию) или `square` — скруглённый квадрат (--radius-button). */
  readonly shape?: 'circle' | 'square';
  readonly className?: string;
}

/** Аватар: фото или инициалы на цветном фоне. */
export function Avatar({ name, src, size = 40, color, shape = 'circle', className }: AvatarProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    fontSize: Math.round(size * 0.36),
    backgroundColor: color ?? undefined,
  };
  const shapeClass = shape === 'square' ? styles.square : null;

  if (src) {
    return (
      <span
        className={cn(
          styles.avatar,
          !!src?.length && styles.avatar_type_photo,
          shapeClass,
          className,
        )}
        style={style}
      >
        <img className={styles.image} src={src} alt={name} />
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(styles.avatar, !color && styles.gradient, shapeClass, className)}
      style={style}
    >
      {initials(name)}
    </span>
  );
}

import type { CSSProperties } from 'react';

import { cn } from '../../lib';

import styles from './skeleton.module.css';

export interface SkeletonProps {
  /** Ширина блока (любое CSS-значение). */
  readonly width?: string;
  /** Высота блока (любое CSS-значение). */
  readonly height?: string;
  /** Радиус скругления; по умолчанию — токен --radius-sm. */
  readonly radius?: string;
  readonly className?: string;
}

/**
 * Базовый плейсхолдер загрузки. Декоративен: скрыт от скринридеров,
 * а статус загрузки сообщает контейнер данных через aria-busy/aria-live.
 */
export function Skeleton({ width, height, radius, className }: SkeletonProps) {
  const style: CSSProperties = { width, height, borderRadius: radius };

  return <span aria-hidden="true" className={cn(styles.skeleton, className)} style={style} />;
}

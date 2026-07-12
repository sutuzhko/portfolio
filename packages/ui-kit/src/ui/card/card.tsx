import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import styles from './card.module.css';

const card = cva(styles.card, {
  variants: {
    padding: {
      none: styles.none,
      md: styles.md,
      lg: styles.lg,
    },
    interactive: {
      true: styles.interactive,
    },
  },
  defaultVariants: {
    padding: 'md',
  },
});

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof card> {}

/**
 * Контейнер-карточка на поверхности. `interactive` добавляет hover-подъём —
 * для кликабельных карточек оберните содержимое в ссылку/кнопку ради семантики.
 */
export function Card({ padding, interactive, className, ...rest }: CardProps) {
  return <div className={card({ padding, interactive, className })} {...rest} />;
}

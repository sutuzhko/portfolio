import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../../lib';

import styles from './chip.module.css';

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed'> {
  /** Выбран ли фильтр. Отражается в aria-pressed и зелёной заливке. */
  readonly selected?: boolean;
}

/** Переключаемый чип-фильтр (технология/контрибьютор). Кнопка-тоггл с aria-pressed. */
export function Chip({ selected = false, className, type = 'button', ...rest }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(styles.chip, selected && styles.selected, className)}
      {...rest}
    />
  );
}

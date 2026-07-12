import type { ButtonHTMLAttributes, MouseEvent } from 'react';

import { cn } from '../../lib';

import styles from './toggle.module.css';

export interface ToggleProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'type' | 'aria-checked'
> {
  readonly checked?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  /** Компактный размер (38×22) для флагов в формах. */
  readonly compact?: boolean;
}

/** Тумблер-переключатель. Семантика switch (role=switch + aria-checked). */
export function Toggle({
  checked = false,
  onCheckedChange,
  compact = false,
  className,
  onClick,
  ...rest
}: ToggleProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    onCheckedChange?.(!checked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={cn(styles.toggle, checked && styles.checked, compact && styles.compact, className)}
      onClick={handleClick}
      {...rest}
    >
      <span className={styles.thumb} aria-hidden="true" />
    </button>
  );
}

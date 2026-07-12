import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';

import styles from './button.module.css';

const button = cva(styles.base, {
  variants: {
    variant: {
      primary: styles.primary,
      ghost: styles.ghost,
      mono: styles.mono,
      text: styles.text,
      icon: styles.icon,
    },
    size: {
      md: styles.md,
      sm: styles.sm,
    },
    fullWidth: {
      true: styles.fullWidth,
    },
  },
  compoundVariants: [
    // icon-вариант квадратный — перекрываем текстовые паддинги размера
    { variant: 'icon', size: 'md', class: styles.iconMd },
    { variant: 'icon', size: 'sm', class: styles.iconSm },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {}

/**
 * Базовая кнопка дизайн-системы. Варианты: primary (главное действие),
 * ghost/mono (вторичные), icon (квадратная, только иконка — обязателен aria-label).
 */
export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button className={button({ variant, size, fullWidth, className })} type={type} {...rest} />
  );
}

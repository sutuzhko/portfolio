import { cva, type VariantProps } from 'class-variance-authority';
import type { ElementType, HTMLAttributes } from 'react';

import styles from './heading.module.css';

const heading = cva(styles.heading, {
  variants: {
    // Визуальный уровень (размер по шкале). Семантику тега задаёт `as`.
    level: {
      display: styles.display,
      h1: styles.h1,
      h2: styles.h2,
      h3: styles.h3,
    },
    tone: {
      default: styles.toneDefault,
      muted: styles.toneMuted,
      primary: styles.tonePrimary,
    },
  },
  defaultVariants: {
    level: 'h2',
    tone: 'default',
  },
});

type HeadingLevel = 'display' | 'h1' | 'h2' | 'h3';
type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/**
 * Тег по умолчанию для каждого визуального уровня. Разрывает жёсткую связь
 * «размер = тег»: крупный display-заголовок может быть `h1`, а мелкий h3 —
 * при необходимости понижен через `as` без потери размера.
 */
const defaultTag: Record<HeadingLevel, HeadingTag> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
};

export interface HeadingProps
  extends HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof heading> {
  /** Переопределяет семантический тег, не трогая визуальный размер. */
  readonly as?: HeadingTag;
}

/**
 * Заголовок дизайн-системы. Визуальный размер (`level`) отделён от семантики
 * (`as`), чтобы порядок заголовков на странице оставался корректным независимо
 * от того, насколько крупно они выглядят.
 */
export function Heading({ level, as, tone, className, ...rest }: HeadingProps) {
  const resolvedLevel = level ?? 'h2';
  const Component: ElementType = as ?? defaultTag[resolvedLevel];

  return <Component className={heading({ level, tone, className })} {...rest} />;
}

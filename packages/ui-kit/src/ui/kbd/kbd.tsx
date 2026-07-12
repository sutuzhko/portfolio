import type { HTMLAttributes } from 'react';

import { cn } from '../../lib';

import styles from './kbd.module.css';

export type KbdProps = HTMLAttributes<HTMLElement>;

/** Клавиша на клавиатуре — для подсказок горячих клавиш (⌘+K, Enter, Esc). */
export function Kbd({ className, ...rest }: KbdProps) {
  return <kbd className={cn(styles.kbd, className)} {...rest} />;
}

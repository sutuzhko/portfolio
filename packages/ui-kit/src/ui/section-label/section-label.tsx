import type { ElementType, HTMLAttributes } from 'react';

import { cn } from '../../lib';

import styles from './section-label.module.css';

/** Допустимые теги-обёртки: по умолчанию заголовок секции `h2`. */
type SectionLabelElement = 'h2' | 'h3' | 'div' | 'span' | 'p';

export interface SectionLabelProps extends HTMLAttributes<HTMLElement> {
  /** Семантический тег. По умолчанию `h2` — метка озаглавливает секцию страницы. */
  readonly as?: SectionLabelElement;
}

/**
 * Моноширинная зелёная метка секции в духе комментария кода (`// стек`).
 * Единый визуальный якорь для секций публичных экранов — чтобы стиль и отступ
 * заголовков не расходились от секции к секции. Префикс `//` — часть контента
 * (приходит из i18n), компонент отвечает только за оформление.
 */
export function SectionLabel({ as, className, ...rest }: SectionLabelProps) {
  const Component: ElementType = as ?? 'h2';

  return <Component className={cn(styles.label, className)} {...rest} />;
}

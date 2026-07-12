import type { ReactNode } from 'react';

import { cn } from '../../lib';
import { Card } from '../card';
import { WindowChrome, type WindowChromeProps } from '../window-chrome';

import styles from './window.module.css';

export interface WindowProps extends WindowChromeProps {
  /** Подпись в шапке — обычно моноширинный путь/имя окна (`~/projects`). */
  readonly title?: ReactNode;
  /** Слот в правой части шапки: вкладки, действия, статус. */
  readonly toolbar?: ReactNode;
  readonly children: ReactNode;
  /** Убрать внутренние отступы тела — для окна с собственной раскладкой. */
  readonly flush?: boolean;
  readonly className?: string;
  readonly bodyClassName?: string;
}

/**
 * Составное «терминальное окно» редизайна: поверхность Card + светофор
 * WindowChrome в шапке. Это пример обособленной сущности из UI Kit — экраны
 * собираются из таких окон, а не из светофора и карточки по отдельности.
 *
 * Логику окна (закрытие, перетаскивание) владелец добавляет снаружи через
 * обработчики WindowChrome — само окно состоянием не управляет.
 */
export function Window({
  title,
  toolbar,
  children,
  flush = false,
  className,
  bodyClassName,
  ...chrome
}: WindowProps) {
  return (
    <Card padding="none" className={cn(styles.window, className)}>
      <header className={styles.header}>
        <WindowChrome {...chrome} />
        {title ? <span className={styles.title}>{title}</span> : null}
        {toolbar ? <div className={styles.toolbar}>{toolbar}</div> : null}
      </header>
      <div className={cn(styles.body, flush && styles.flush, bodyClassName)}>{children}</div>
    </Card>
  );
}

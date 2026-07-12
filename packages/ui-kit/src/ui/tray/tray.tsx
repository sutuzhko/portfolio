import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import styles from './tray.module.css';

const TRAY_ATTRIBUTE = 'data-tray-root';

/**
 * Единственный контейнер трея на страницу. Создаётся лениво и переиспользуется
 * (ищем по атрибуту), поэтому несколько источников — консоль и раннер — кладут
 * свои пилюли в один стек, а не перекрывают друг друга.
 */
function getTrayRoot(): HTMLElement {
  const existing = document.querySelector(`[${TRAY_ATTRIBUTE}]`);
  if (existing instanceof HTMLElement) {
    return existing;
  }
  const root = document.createElement('div');
  root.setAttribute(TRAY_ATTRIBUTE, '');
  root.className = styles.tray;
  document.body.appendChild(root);
  return root;
}

export interface TrayPortalProps {
  readonly children: ReactNode;
}

/**
 * Порталит содержимое (свёрнутую пилюлю окна) в общий трей внизу справа.
 * Разные окна порталят в один и тот же контейнер, поэтому их пилюли стыкуются
 * в общий стек. Контейнер прозрачен для кликов — активны только сами пилюли.
 *
 * Корень трея берётся в эффекте (не при рендере), чтобы не трогать DOM во время
 * рендера и не падать там, где `document` недоступен.
 */
export function TrayPortal({ children }: TrayPortalProps) {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setRoot(getTrayRoot());
  }, []);

  if (root === null) {
    return null;
  }
  return createPortal(children, root);
}

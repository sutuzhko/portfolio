import type { ReactNode } from 'react';

import { cn } from '../../lib';

import styles from './window-chrome.module.css';

const glyphs: Record<'close' | 'minimize' | 'maximize', ReactNode> = {
  close: (
    <svg className={styles.glyph} width="8" height="8" viewBox="0 0 10 10" aria-hidden="true">
      <path
        d="M2.4 2.4l5.2 5.2M7.6 2.4l-5.2 5.2"
        stroke="rgba(74,0,0,.62)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  minimize: (
    <svg className={styles.glyph} width="8" height="8" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2.2 5h5.6" stroke="rgba(92,56,0,.62)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  maximize: (
    <svg
      className={styles.glyph}
      width="8"
      height="8"
      viewBox="0 0 10 10"
      fill="rgba(0,58,0,.64)"
      aria-hidden="true"
    >
      <path d="M2 2.3h4.4L2 6.7z" />
      <path d="M8 7.7H3.6L8 3.3z" />
    </svg>
  ),
};

interface LightConfig {
  readonly key: 'close' | 'minimize' | 'maximize';
  readonly colorClass: string;
  readonly onClick?: () => void;
  readonly label?: string;
}

export interface WindowChromeProps {
  readonly onClose?: () => void;
  readonly onMinimize?: () => void;
  readonly onMaximize?: () => void;
  readonly closeLabel?: string;
  readonly minimizeLabel?: string;
  readonly maximizeLabel?: string;
  readonly className?: string;
}

/**
 * «Светофор» оконного хрома: закрыть · свернуть · развернуть.
 * Глифы проявляются при наведении на группу. Кнопки появляются только
 * для переданных обработчиков, остальные точки — декоративные.
 */
export function WindowChrome({
  onClose,
  onMinimize,
  onMaximize,
  closeLabel,
  minimizeLabel,
  maximizeLabel,
  className,
}: WindowChromeProps) {
  const lights: LightConfig[] = [
    { key: 'close', colorClass: styles.close, onClick: onClose, label: closeLabel },
    { key: 'minimize', colorClass: styles.minimize, onClick: onMinimize, label: minimizeLabel },
    { key: 'maximize', colorClass: styles.maximize, onClick: onMaximize, label: maximizeLabel },
  ];

  return (
    <div className={cn(styles.lights, className)}>
      {lights.map(({ key, colorClass, onClick, label }) =>
        onClick ? (
          <button
            key={key}
            type="button"
            aria-label={label}
            className={cn(styles.light, colorClass, styles.actionable)}
            onClick={onClick}
          >
            {glyphs[key]}
          </button>
        ) : (
          <span key={key} aria-hidden="true" className={cn(styles.light, colorClass)} />
        ),
      )}
    </div>
  );
}

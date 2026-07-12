import { useTranslation } from 'react-i18next';

import { cn, consoleShortcut, useHasKeyboard, useMoscowClock } from '@/shared/lib';
import { Kbd, WindowChrome } from '@sutuzhko/ui-kit';

import {
  CONSOLE_GLYPH,
  TERMINAL_LINES,
  TERMINAL_LOCATION,
  TERMINAL_TITLE,
  TERMINAL_USER,
} from '../model/config';

import styles from './terminal-card.module.css';

export interface TerminalCardProps {
  /** Открыть консоль по клику на «плашку». */
  readonly onOpenConsole: () => void;
  readonly className?: string;
}

function Prompt() {
  return (
    <>
      <span className={styles.user}>{TERMINAL_USER}</span>
      <span className={styles.path}>:~$</span>{' '}
    </>
  );
}

/**
 * Терминал-карточка героя (правая колонка макета): «оконный» хром (декоративный
 * `WindowChrome` + заголовок), тело с командами и плашка-приглашение открыть
 * консоль. Содержимое терминала — статичный флейвор из конфига.
 */
export function TerminalCard({ onOpenConsole, className }: TerminalCardProps) {
  const { t } = useTranslation();
  const clock = useMoscowClock();
  // На тач-устройствах нет клавиатурных шорткатов — вместо ⌘K показываем «нажмите».
  const hasKeyboard = useHasKeyboard();

  return (
    <div className={cn(styles.terminal, className)}>
      <div className={styles.head}>
        <WindowChrome />
        <span className={styles.headTitle}>{TERMINAL_TITLE}</span>
      </div>

      <div className={styles.body}>
        {TERMINAL_LINES.map((line) => (
          <div key={line.cmd} className={styles.block}>
            <div className={styles.line}>
              <Prompt />
              <span className={styles.cmd}>{line.cmd}</span>
            </div>
            <div className={styles.output}>{line.output}</div>
          </div>
        ))}
        <div className={styles.block}>
          <div className={styles.line}>
            <Prompt />
            <span className={styles.cmd}>{TERMINAL_LOCATION.cmd}</span>
          </div>
          <div className={styles.output}>
            {TERMINAL_LOCATION.prefix}
            <span className={styles.clock}>{clock}</span>
            {TERMINAL_LOCATION.suffix}
          </div>
        </div>
        <div className={styles.line}>
          <Prompt />
          <span className={styles.caret} aria-hidden="true" />
        </div>
      </div>

      <button type="button" className={styles.pill} onClick={onOpenConsole}>
        <span className={styles.pillGlyph} aria-hidden="true">
          {CONSOLE_GLYPH}
        </span>
        <span className={styles.pillBody}>
          <span className={styles.pillTitle}>{t('home.hero.console.title')}</span>
          <span className={styles.pillText}>
            {hasKeyboard
              ? t('home.hero.console.text', { shortcut: consoleShortcut() })
              : t('home.hero.console.textTouch')}
          </span>
        </span>
        {hasKeyboard ? <Kbd className={styles.pillKbd}>{consoleShortcut()}</Kbd> : null}
      </button>
    </div>
  );
}

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { Profile } from '@/entities/profile';
import { cn } from '@/shared/lib';
import { DockPill, TrayPortal, WindowChrome } from '@sutuzhko/ui-kit';

import type { ConsoleEntry } from '../model/commands';
import { CONSOLE_TITLE_PREFIX } from '../model/config';

import { ConsoleHelp } from './console-help';
import { ConsoleWelcome } from './console-welcome';
import { Prompt } from './console-prompt';
import styles from './console.module.css';

/** Состояние окна консоли. `minimized` показывает только пилюлю в трее. */
export type ConsoleWindowState = 'normal' | 'maximized' | 'minimized';

export interface ConsoleViewProps {
  readonly isOpen: boolean;
  readonly windowState: ConsoleWindowState;
  /** Метка маршрута в заголовке `bash — <route>`. */
  readonly routeLabel: string;
  readonly entries: readonly ConsoleEntry[];
  readonly input: string;
  readonly profile?: Profile;
  readonly clock: string;
  readonly onInputChange: (value: string) => void;
  readonly onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly onClose: () => void;
  readonly onMinimize: () => void;
  readonly onToggleMaximize: () => void;
  readonly onRestore: () => void;
}

/** Одна строка ленты: эхо ввода, текстовый вывод, справка или приветствие. */
function FeedEntry({
  entry,
  profile,
  clock,
}: {
  readonly entry: ConsoleEntry;
  readonly profile?: Profile;
  readonly clock: string;
}) {
  if (entry.kind === 'welcome') {
    return <ConsoleWelcome profile={profile} clock={clock} />;
  }
  if (entry.kind === 'help') {
    return <ConsoleHelp />;
  }
  if (entry.kind === 'input') {
    return (
      <div className={styles.line}>
        <Prompt />
        <span className={styles.cmd}>{entry.text}</span>
      </div>
    );
  }
  return <div className={styles.textOut}>{entry.body}</div>;
}

/**
 * Презентационный оверлей консоли — терминальное окно поверх страницы. Всё
 * состояние (лента, ввод, размер окна) приходит пропами, поэтому компонент
 * полностью управляем и документируется в Storybook.
 *
 * Доступность: окно — модальный `dialog` с фокусом на скрытом поле ввода,
 * ловушкой Tab и лентой-логом (`role="log"`), которую озвучивают скринридеры.
 */
export function ConsoleView({
  isOpen,
  windowState,
  routeLabel,
  entries,
  input,
  profile,
  clock,
  onInputChange,
  onInputKeyDown,
  onClose,
  onMinimize,
  onToggleMaximize,
  onRestore,
}: ConsoleViewProps) {
  const { t } = useTranslation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Позиция каретки скрытого поля — чтобы блок-курсор в эхе стоял там же, где реальная
  // каретка (стрелки ←/→, Home/End двигают её). Иначе курсор всегда «прилипал» к концу.
  const [caret, setCaret] = useState(0);
  const syncCaret = (): void => setCaret(inputRef.current?.selectionStart ?? 0);

  const isMaximized = windowState === 'maximized';
  const active = isOpen && windowState !== 'minimized';

  // Фокус на поле ввода при открытии/разворачивании/смене размера. Клик по
  // некликабельной ленте фокус не уводит, а после кнопок хрома возвращаем сюда.
  useEffect(() => {
    if (active) {
      inputRef.current?.focus();
    }
  }, [active, windowState]);

  // Автопрокрутка ленты вниз к новому выводу.
  useEffect(() => {
    if (active && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [active, entries.length]);

  // Пока консоль открыта — блокируем прокрутку страницы: скроллится только лента.
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);

  // Единственный терминал «владеет» всем экраном: колесо мыши за пределами окна
  // прокручивает его ленту. Внутри ленты — нативная прокрутка. (Когда терминалов
  // станет несколько, каждый будет скроллиться только внутри себя — этот перехват
  // живёт на оверлее конкретной консоли.)
  useEffect(() => {
    const overlay = overlayRef.current;
    const feed = feedRef.current;
    if (!active || !overlay || !feed) return;

    const onWheel = (event: WheelEvent): void => {
      const target = event.target;
      if (target instanceof Node && feed.contains(target)) return;
      feed.scrollTop += event.deltaY;
      event.preventDefault();
    };

    overlay.addEventListener('wheel', onWheel, { passive: false });
    return () => overlay.removeEventListener('wheel', onWheel);
  }, [active]);

  // Ловушка фокуса: Tab не выходит за пределы окна. Слушатель вешаем императивно,
  // чтобы не навешивать обработчики на неинтерактивную роль dialog (a11y-линт).
  useEffect(() => {
    const card = cardRef.current;
    if (!active || !card) return;

    const onKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key !== 'Tab') return;
      const focusables = Array.from(card.querySelectorAll<HTMLElement>('button, input')).filter(
        (element) => element.tabIndex !== -1,
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    card.addEventListener('keydown', onKeyDown);
    return () => card.removeEventListener('keydown', onKeyDown);
  }, [active]);

  if (!isOpen) return null;

  if (windowState === 'minimized') {
    // Общий трей (см. TrayPortal): пилюли консоли и раннера стыкуются в один стек,
    // а не перекрывают друг друга в одном углу.
    return (
      <TrayPortal>
        <DockPill
          label={`${CONSOLE_TITLE_PREFIX}${routeLabel}`}
          onClose={onClose}
          onRestore={onRestore}
          closeLabel={t('console.a11y.close')}
          restoreLabel={t('console.a11y.restore')}
        />
      </TrayPortal>
    );
  }

  return (
    <div ref={overlayRef} className={cn(styles.overlay, isMaximized && styles.overlayMax)}>
      <button
        type="button"
        tabIndex={-1}
        aria-label={t('console.a11y.close')}
        className={styles.backdrop}
        onClick={onClose}
      />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('console.a11y.dialog')}
        className={cn(styles.card, isMaximized && styles.cardMax)}
      >
        <header className={styles.head}>
          <WindowChrome
            onClose={onClose}
            onMinimize={onMinimize}
            onMaximize={onToggleMaximize}
            closeLabel={t('console.a11y.close')}
            minimizeLabel={t('console.a11y.minimize')}
            maximizeLabel={t(isMaximized ? 'console.a11y.restore' : 'console.a11y.maximize')}
          />
          <span className={styles.title}>
            {CONSOLE_TITLE_PREFIX}
            {routeLabel}
          </span>
        </header>

        <div ref={feedRef} className={styles.feed} role="log" aria-live="polite">
          {entries.map((entry) => (
            <FeedEntry key={entry.id} entry={entry} profile={profile} clock={clock} />
          ))}
          <div className={styles.line}>
            <Prompt />
            <span className={styles.inputEcho}>
              {input.slice(0, Math.min(caret, input.length))}
            </span>
            <span className={styles.cursor} aria-hidden="true" />
            <span className={styles.inputEcho}>{input.slice(Math.min(caret, input.length))}</span>
          </div>
        </div>

        <input
          ref={inputRef}
          className={styles.hiddenInput}
          value={input}
          onChange={(event) => {
            onInputChange(event.target.value);
            setCaret(event.target.selectionStart ?? event.target.value.length);
          }}
          onKeyDown={onInputKeyDown}
          onKeyUp={syncCaret}
          onClick={syncCaret}
          onSelect={syncCaret}
          aria-label={t('console.a11y.input')}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}

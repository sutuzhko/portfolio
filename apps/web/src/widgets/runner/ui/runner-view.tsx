import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import { DockPill, TrayPortal, WindowChrome } from '@sutuzhko/ui-kit';

import type { RunnerProject } from '../model/runner-context';

import styles from './runner.module.css';

/** Состояние окна раннера. `minimized` показывает только пилюлю в трее. */
export type RunnerWindowState = 'normal' | 'maximized' | 'minimized';

/**
 * Статус встраивания проекта: грузится → загрузился / не удалось.
 * Кросс-доменный iframe не отдаёт `onError` при мёртвом хосте, поэтому провал
 * ловим по таймауту (см. `loadTimeoutMs`), а `onError` — как быстрый путь.
 */
type RunnerStatus = 'loading' | 'ready' | 'error';

/** Сколько ждём загрузки проекта, прежде чем считать запуск неудавшимся. */
const DEFAULT_LOAD_TIMEOUT_MS = 8_000;

export interface RunnerViewProps {
  readonly project: RunnerProject;
  readonly windowState: RunnerWindowState;
  readonly onClose: () => void;
  readonly onMinimize: () => void;
  readonly onToggleMaximize: () => void;
  readonly onRestore: () => void;
  /** Вызывается один раз, когда запуск проваливается — контейнер шлёт тост. */
  readonly onError: () => void;
  /** Таймаут ожидания загрузки, мс. Проп ради тестов/историй; в приложении — дефолт. */
  readonly loadTimeoutMs?: number;
}

/**
 * Презентационный оверлей раннера — оконный «хром» со светофором, внутри которого
 * запущенный проект встроен через `<iframe>`. Всё состояние приходит пропами,
 * поэтому компонент управляем и документируется в Storybook.
 *
 * Пока проект грузится, поверх iframe показывается заглушка. Если за `loadTimeoutMs`
 * он так и не загрузился (переехал/офлайн) — вместо спиннера показываем bash-подобную
 * ошибку и уведомляем через `onError`, а не «висим» вечным спиннером. Встраивание
 * изолируем `sandbox`: скрипты и своё хранилище проекта разрешены, а выход за пределы
 * окна (навигация верхнего уровня, попапы) — нет.
 */
export function RunnerView({
  project,
  windowState,
  onClose,
  onMinimize,
  onToggleMaximize,
  onRestore,
  onError,
  loadTimeoutMs = DEFAULT_LOAD_TIMEOUT_MS,
}: RunnerViewProps) {
  const { t } = useTranslation();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<RunnerStatus>('loading');
  const notifiedRef = useRef(false);

  const isMaximized = windowState === 'maximized';
  const active = windowState !== 'minimized';

  // Новый проект — снова показываем заглушку и разрешаем повторное уведомление.
  useEffect(() => {
    setStatus('loading');
    notifiedRef.current = false;
  }, [project.embedUrl]);

  // Пока грузится — заводим таймер провала; загрузка/размонтирование его снимают.
  useEffect(() => {
    if (status !== 'loading') return;
    const timer = window.setTimeout(() => setStatus('error'), loadTimeoutMs);
    return () => window.clearTimeout(timer);
  }, [status, project.embedUrl, loadTimeoutMs]);

  // При провале уведомляем контейнер ровно один раз (тост живёт снаружи вида).
  useEffect(() => {
    if (status === 'error' && !notifiedRef.current) {
      notifiedRef.current = true;
      onError();
    }
  }, [status, onError]);

  // Пока раннер открыт — блокируем прокрутку страницы.
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);

  // После загрузки уводим фокус в iframe — чтобы игра сразу ловила клавиатуру.
  useEffect(() => {
    if (active && status === 'ready') frameRef.current?.focus();
  }, [active, status, windowState]);

  if (windowState === 'minimized') {
    return (
      <TrayPortal>
        <DockPill
          label={project.title}
          onClose={onClose}
          onRestore={onRestore}
          onMaximize={onToggleMaximize}
          closeLabel={t('runner.a11y.close')}
          restoreLabel={t('runner.a11y.restore')}
          maximizeLabel={t('runner.a11y.maximize')}
        />
      </TrayPortal>
    );
  }

  return (
    <div className={cn(styles.overlay, isMaximized && styles.overlayMax)}>
      <button
        type="button"
        tabIndex={-1}
        aria-label={t('runner.a11y.close')}
        className={styles.backdrop}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('runner.a11y.dialog', { project: project.title })}
        className={cn(styles.card, isMaximized && styles.cardMax)}
      >
        <header className={styles.head}>
          <WindowChrome
            onClose={onClose}
            onMinimize={onMinimize}
            onMaximize={onToggleMaximize}
            closeLabel={t('runner.a11y.close')}
            minimizeLabel={t('runner.a11y.minimize')}
            maximizeLabel={t(isMaximized ? 'runner.a11y.restore' : 'runner.a11y.maximize')}
          />
          <span className={styles.title}>{project.title}</span>
        </header>

        <div className={styles.body}>
          {status === 'error' ? (
            <div className={styles.error} role="alert">
              <p className={styles.errorBash}>{t('runner.error.bash', { title: project.title })}</p>
              <p className={styles.errorHint}>{t('runner.error.hint')}</p>
            </div>
          ) : (
            <>
              <iframe
                ref={frameRef}
                src={project.embedUrl}
                title={project.title}
                className={styles.frame}
                sandbox="allow-scripts allow-same-origin"
                onLoad={() => setStatus('ready')}
                onError={() => setStatus('error')}
              />
              {status === 'loading' ? (
                <div className={styles.loading}>
                  <span className={styles.spinner} aria-hidden="true" />
                  {t('runner.loading')}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';

// Линия-детектор: секция считается текущей, когда её верх пересёк ~35 % высоты экрана.
const ACTIVE_LINE_RATIO = 0.35;
const BOTTOM_EPSILON = 2;

/**
 * Скролл-шпион: отражает текущую секцию в хэше URL при прокрутке.
 *
 * Текущая — последняя секция, чей верх поднялся выше линии-детектора; у самого
 * низа страницы активна последняя секция (её не докрутить до линии), а у самого
 * верха хэш очищается. Обновляем хэш через `history.replaceState` — без записей
 * в историю, без навигации React Router и, значит, без ре-рендеров.
 */
export function useScrollSpy(sectionIds: readonly string[]): void {
  // Ключ по составу id — стабилен между рендерами при том же наборе секций.
  const key = sectionIds.join('|');

  useEffect(() => {
    const ids = key ? key.split('|') : [];
    if (ids.length === 0) return;

    let frame = 0;

    const resolveActive = (): string => {
      const scrollBottom = window.scrollY + window.innerHeight;
      const atBottom = scrollBottom >= document.documentElement.scrollHeight - BOTTOM_EPSILON;
      if (atBottom) return ids[ids.length - 1] ?? '';

      const line = window.innerHeight * ACTIVE_LINE_RATIO;
      let active = '';
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= line) active = id;
      }
      return active;
    };

    const sync = (): void => {
      frame = 0;
      const active = resolveActive();
      const { pathname, search, hash } = window.location;

      if (active) {
        const nextHash = `#${active}`;
        if (hash !== nextHash)
          window.history.replaceState(null, '', `${pathname}${search}${nextHash}`);
      } else if (hash) {
        // Вернулись к самому верху — убираем хэш.
        window.history.replaceState(null, '', `${pathname}${search}`);
      }
    };

    const onScroll = (): void => {
      if (!frame) frame = window.requestAnimationFrame(sync);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    sync();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [key]);
}

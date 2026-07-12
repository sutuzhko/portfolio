import { useLayoutEffect, useRef, type RefObject } from 'react';

interface RevealOptions {
  /** Смещение появления по вертикали, px (макет: rise = 8px). */
  readonly y?: number;
  /** Длительность появления одного элемента, сек. */
  readonly duration?: number;
  /** Задержка между соседними детьми, попавшими в вид одновременно, сек. */
  readonly stagger?: number;
}

// Минимальная структурная форма нужных частей gsap — чтобы не тянуть типы (и тем
// более значение) библиотеки в статический граф (её грузим динамически).
interface RevealTween {
  kill: () => void;
  progress: (value: number) => void;
}

interface GsapApi {
  fromTo: (
    targets: readonly HTMLElement[],
    fromVars: Record<string, unknown>,
    toVars: Record<string, unknown>,
  ) => RevealTween;
}

/**
 * Плавное «rise + fade» появление прямых детей контейнера **по мере попадания в
 * вьюпорт** при прокрутке — из словаря анимаций макета (`@keyframes rise`:
 * opacity 0→1, translateY 8px→0), сдержанно. Возвращает ref для контейнера
 * (например, `<main>` страницы); секции первого экрана появляются на загрузке,
 * остальные — когда до них доскроллили.
 *
 * Триггер — нативный **IntersectionObserver** (надёжнее gsap ScrollTrigger,
 * который завязан на `window.innerHeight` и ломается при нестандартном
 * вьюпорте). Сама анимация — gsap, подгружаемый **динамически** (`import('gsap')`
 * при первом появлении), поэтому тяжёлая либа не попадает в основной бандл.
 *
 * Отказоустойчивость (контент не может залипнуть скрытым): нет IO —
 * показываем сразу; gsap не загрузился — раскрываем без анимации; IO не сработал
 * за таймаут — failsafe раскрывает оставшееся; замёрзший rAF-тикер (фоновая
 * вкладка) добивает `tween.progress(1)` по setTimeout. `prefers-reduced-motion`
 * — анимации нет, контент виден сразу. Начальное скрытие ставится синхронно
 * инлайновым стилем в useLayoutEffect (до отрисовки) — вспышки нет.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(
  options: RevealOptions = {},
): RefObject<T | null> {
  const { y = 8, duration = 0.5, stagger = 0.08 } = options;
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return undefined;
    }
    const items = Array.from(el.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );
    if (items.length === 0) {
      return undefined;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const clearHidden = (targets: readonly HTMLElement[]): void => {
      for (const target of targets) {
        target.style.removeProperty('opacity');
        target.style.removeProperty('transform');
        target.style.removeProperty('will-change');
      }
    };

    // Прячем синхронно, до первой отрисовки → вспышки готового контента нет.
    for (const item of items) {
      item.style.opacity = '0';
      item.style.transform = `translateY(${String(y)}px)`;
      item.style.willChange = 'opacity, transform';
    }

    // Без IntersectionObserver скролл-триггер невозможен — показываем сразу.
    if (typeof IntersectionObserver === 'undefined') {
      clearHidden(items);
      return undefined;
    }

    let cancelled = false;
    const pending = new Set<HTMLElement>(items);
    const tweens = new Set<RevealTween>();
    let gsapApi: GsapApi | undefined;
    let gsapPromise: Promise<void> | undefined;

    // Если IO по какой-то причине не сработал (нестандартный вьюпорт и т.п.) —
    // раскрываем оставшееся, чтобы контент не залип скрытым.
    const failsafe = window.setTimeout(() => {
      clearHidden(Array.from(pending));
      pending.clear();
    }, 8000);

    const animate = (batch: readonly HTMLElement[]): void => {
      if (cancelled || batch.length === 0) {
        return;
      }
      if (!gsapApi) {
        clearHidden(batch);
        return;
      }
      const tween: RevealTween = gsapApi.fromTo(
        batch,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          ease: 'power2.out',
          stagger,
          clearProps: 'opacity,transform,willChange',
          onComplete: () => {
            tweens.delete(tween);
          },
        },
      );
      tweens.add(tween);
      // Доводчик на случай замороженного rAF (фоновая вкладка/троттлинг):
      // setTimeout не зависит от rAF и синхронно доигрывает твин до конца.
      const guardMs = (duration + stagger * batch.length + 0.4) * 1000;
      window.setTimeout(() => {
        tween.progress(1);
      }, guardMs);
    };

    const reveal = (batch: readonly HTMLElement[]): void => {
      for (const item of batch) {
        pending.delete(item);
      }
      if (pending.size === 0) {
        window.clearTimeout(failsafe);
      }
      gsapPromise ??= import('gsap')
        .then((module) => {
          gsapApi = module.gsap;
        })
        .catch(() => {
          // Оставляем gsapApi undefined → animate() просто покажет без анимации.
        });
      void gsapPromise.then(() => {
        if (!cancelled) {
          animate(batch);
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        const entered = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target)
          .filter((target): target is HTMLElement => target instanceof HTMLElement);
        if (entered.length === 0) {
          return;
        }
        for (const target of entered) {
          obs.unobserve(target);
        }
        reveal(entered);
      },
      // Небольшой нижний отступ — секция «раскрывается», едва заметно войдя в кадр.
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    );
    for (const item of items) {
      observer.observe(item);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      observer.disconnect();
      for (const tween of tweens) {
        tween.kill();
      }
      clearHidden(items);
    };
  }, [y, duration, stagger]);

  return ref;
}

import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';

import styles from './featured.module.css';

/**
 * Ряд тегов, который вмещает столько технологий, сколько влезает по ширине, а
 * остаток сворачивает в счётчик «+N». Считаем по фактическим ширинам: лишние теги
 * держим в потоке измеримыми (`position:absolute; visibility:hidden`), пересчёт —
 * на ResizeObserver. Так контент ограничивается счётчиком, а не обрезается.
 */
export function TagRow({ tags }: { readonly tags: readonly string[] }) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(tags.length);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const compute = (): void => {
      const items = Array.from(container.querySelectorAll<HTMLElement>('[data-tag]'));
      const counter = container.querySelector<HTMLElement>('[data-counter]');
      if (items.length === 0) return;

      const available = container.clientWidth;
      const gap = Number.parseFloat(getComputedStyle(container).columnGap) || 0;

      let used = 0;
      let fit = 0;
      for (let index = 0; index < items.length; index += 1) {
        const width = items[index].offsetWidth + (fit > 0 ? gap : 0);
        const rest = items.length - index - 1;
        const counterWidth = rest > 0 && counter ? counter.offsetWidth + gap : 0;
        if (used + width + counterWidth > available) break;
        used += width;
        fit += 1;
      }

      setVisible(Math.max(1, fit));
    };

    const observer = new ResizeObserver(compute);
    observer.observe(container);
    compute();
    return () => observer.disconnect();
  }, [tags]);

  const hidden = tags.length - visible;

  return (
    <span ref={containerRef} className={styles.tags}>
      {tags.map((tech, index) => (
        <span
          key={tech}
          data-tag
          className={cn(styles.tag, index >= visible && styles.tagMeasured)}
        >
          {tech}
        </span>
      ))}
      {hidden > 0 ? (
        <span data-counter className={styles.tag}>
          {t('home.featured.extra', { count: hidden })}
        </span>
      ) : null}
    </span>
  );
}

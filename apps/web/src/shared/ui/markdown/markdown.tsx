import { useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/shared/lib';

import styles from './markdown.module.css';

export interface MarkdownProps {
  /** Исходный текст в формате Markdown (GFM). */
  readonly children: string;
  /** Внешняя обёртка — размер шрифта (`--md-font-size`), max-width и т.п. */
  readonly className?: string;
  /** Переопределение рендереров (например, вики-ссылки `[[slug]]` в БЗ). */
  readonly components?: Components;
}

// GFM даёт таблицы (главное), а заодно зачёркивание, таск-листы и автоссылки.
const REMARK_PLUGINS = [remarkGfm];

const baseComponents: Components = {
  // Ссылки в контенте ведут наружу — открываем в новой вкладке безопасно.
  // `children` пробрасываем явно, иначе jsx-a11y/anchor-has-content ругается на spread.
  a: ({ node: _node, children, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  // Широкая таблица не должна ломать лейаут — заворачиваем в скролл-контейнер.
  table: ({ node: _node, children, ...props }) => (
    <div className={styles.tableWrap}>
      <table {...props}>{children}</table>
    </div>
  ),
};

/**
 * Единый рендерер Markdown для всего приложения (About, деталь проекта, БЗ).
 * Держит общую типографику `.prose` и стили таблиц, поддерживает GFM. Потребители
 * настраивают размер/ширину через `className` и расширяют рендереры через `components`.
 */
export function Markdown({ children, className, components }: MarkdownProps) {
  const merged = useMemo<Components>(
    () => (components ? { ...baseComponents, ...components } : baseComponents),
    [components],
  );

  return (
    <div className={cn(styles.prose, className)}>
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={merged}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

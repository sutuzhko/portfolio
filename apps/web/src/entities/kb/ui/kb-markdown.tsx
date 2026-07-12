import { useMemo } from 'react';
import { type Components } from 'react-markdown';

import { Markdown } from '@/shared/ui';

import styles from './kb-markdown.module.css';

const WIKILINK = /\[\[([^[\]]+)\]\]/g;
const WIKI_HREF = '#wiki:';

export interface KbMarkdownProps {
  /** Тело статьи в Markdown. */
  readonly source: string;
  /** Переход по вики-ссылке `[[slug]]`. Без него ссылки неактивны (например, в превью). */
  readonly onNavigate?: (slug: string) => void;
}

/**
 * Тело статьи БЗ в Markdown с поддержкой вики-ссылок `[[slug]]`. Общий для
 * публичного читателя и кабинета (просмотр + живое превью редактора): `[[slug]]`
 * превращаем в ссылку со служебной схемой и разбираем кастомным рендерером —
 * чтобы кликать по связям, не таща remark-плагин. Внешние ссылки — в новой вкладке.
 */
export function KbMarkdown({ source, onNavigate }: KbMarkdownProps) {
  const prepared = useMemo(
    () =>
      source.replace(WIKILINK, (_match, target: string) => `[${target}](${WIKI_HREF}${target})`),
    [source],
  );

  const components = useMemo<Components>(
    () => ({
      a: ({ node: _node, href, children, ...props }) => {
        // Не-вики ссылка — отдаём обычную внешнюю (стили берёт общий `.prose a`).
        if (href === undefined || !href.startsWith(WIKI_HREF)) {
          return (
            <a {...props} href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        }
        const slug = href.slice(WIKI_HREF.length);
        if (onNavigate === undefined) {
          return <span className={styles.wikilink}>{children}</span>;
        }
        return (
          <button type="button" className={styles.wikilink} onClick={() => onNavigate(slug)}>
            {children}
          </button>
        );
      },
    }),
    [onNavigate],
  );

  return (
    <Markdown className={styles.kb} components={components}>
      {prepared}
    </Markdown>
  );
}

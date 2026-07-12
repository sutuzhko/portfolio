import { useTranslation } from 'react-i18next';
import Markdown, { type Components } from 'react-markdown';

import { cn } from '@/shared/lib';
import { SectionLabel, Skeleton } from '@sutuzhko/ui-kit';

import styles from './about.module.css';

export interface AboutProps {
  /** Био в формате Markdown (локализованное поле профиля). */
  readonly bioMarkdown?: string;
  readonly isLoading?: boolean;
  /** Якорь секции для навигации и скролл-шпиона. */
  readonly id?: string;
  readonly className?: string;
}

// Ссылки в био ведут на внешние ресурсы — открываем в новой вкладке безопасно
// (`rel="noopener"`). `node` из react-markdown в DOM не пробрасываем.
const markdownComponents: Components = {
  a: ({ node: _node, children, ...props }) => (
    <a {...props} className={styles.link} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

/**
 * Секция «Обо мне» (макет: ABOUT) — заголовок `// обо мне` и текст-био в Markdown.
 * Био приходит с бэкенда (`profile.bioMarkdown`), локализовано по языку приложения,
 * поэтому пока профиль грузится — рендерим скелетон-абзацы.
 */
export function About({ bioMarkdown, isLoading, id, className }: AboutProps) {
  const { t } = useTranslation();

  return (
    <section id={id} className={cn(styles.section, className)}>
      <SectionLabel>{t('home.sections.about')}</SectionLabel>
      {isLoading || !bioMarkdown ? (
        <AboutSkeleton />
      ) : (
        <div className={styles.prose}>
          <Markdown components={markdownComponents}>{bioMarkdown}</Markdown>
        </div>
      )}
    </section>
  );
}

function AboutSkeleton() {
  // Три абзаца-заглушки под структуру био (макет: 3 абзаца), высота строк = line-box.
  return (
    <div className={styles.prose} aria-busy="true" aria-live="polite">
      {[
        ['100%', '96%', '88%'],
        ['100%', '72%'],
        ['90%', '54%'],
      ].map((lines, index) => (
        <div key={index} className={styles.skeletonParagraph}>
          {lines.map((width, line) => (
            <Skeleton key={line} width={width} height="var(--about-line-box)" />
          ))}
        </div>
      ))}
    </div>
  );
}

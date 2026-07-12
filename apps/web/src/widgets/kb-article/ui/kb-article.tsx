import { useTranslation } from 'react-i18next';

import { type ArticleDetail, KbMarkdown } from '@/entities/kb';
import { ErrorState } from '@sutuzhko/ui-kit';

import { KbArticleSkeleton } from './kb-article-skeleton';
import { KbBacklinks } from './kb-backlinks';
import styles from './kb-article.module.css';

export interface KbArticleProps {
  readonly article: ArticleDetail | undefined;
  /** Выбрана ли статья в дереве (иначе — приглашающее пустое состояние). */
  readonly hasSelection: boolean;
  readonly isLoading?: boolean;
  readonly isError?: boolean;
  /** Переход к другой статье (вики-ссылка или бэклинк). */
  readonly onNavigate: (slug: string) => void;
  readonly onRetry?: () => void;
}

/**
 * Читатель статьи БЗ: хлебные крошки, теги, тело в Markdown и блок бэклинков.
 * Презентационный — состояние приходит пропами: нет выбора → приглашение,
 * загрузка → скелетон, ошибка → карточка ошибки.
 */
export function KbArticle({
  article,
  hasSelection,
  isLoading,
  isError,
  onNavigate,
  onRetry,
}: KbArticleProps) {
  const { t } = useTranslation();

  if (!hasSelection) {
    return (
      <div className={styles.reader}>
        <p className={styles.empty}>{t('database.empty')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.reader}>
        <ErrorState className={styles.error} message={t('database.error')} onRetry={onRetry} />
      </div>
    );
  }

  if (isLoading || article === undefined) {
    return (
      <div className={styles.reader}>
        <KbArticleSkeleton />
      </div>
    );
  }

  return (
    <article className={styles.reader}>
      <header className={styles.head}>
        <p className={styles.breadcrumb}>{article.breadcrumb.join(' / ')}</p>
        {article.tags.length > 0 ? (
          <div className={styles.tags}>
            {article.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <div className={styles.body}>
        <KbMarkdown source={article.bodyMarkdown} onNavigate={onNavigate} />
      </div>

      <KbBacklinks backlinks={article.backlinks} onNavigate={onNavigate} />
    </article>
  );
}

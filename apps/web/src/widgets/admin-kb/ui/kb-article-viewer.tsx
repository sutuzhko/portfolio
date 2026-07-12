import { useTranslation } from 'react-i18next';

import { type ArticleDetail, KbMarkdown } from '@/entities/kb';
import { Icon, Skeleton } from '@sutuzhko/ui-kit';

import styles from './admin-kb.module.css';

export interface KbArticleViewerProps {
  readonly article: ArticleDetail | undefined;
  /** Выбрана ли статья (иначе — приглашающее пустое состояние). */
  readonly hasSelection: boolean;
  readonly isLoading: boolean;
  readonly onEdit: () => void;
  readonly onNavigate: (slug: string) => void;
}

/** Правая панель БЗ в режиме просмотра: пусто / скелетон / статья с бэклинками. */
export function KbArticleViewer({
  article,
  hasSelection,
  isLoading,
  onEdit,
  onNavigate,
}: KbArticleViewerProps) {
  const { t } = useTranslation();

  if (!hasSelection) {
    return (
      <div className={styles.rightPane}>
        <div className={styles.emptyState}>
          <Icon name="file" size={40} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>{t('admin.kb.empty')}</p>
          <p className={styles.emptyHint}>{t('admin.kb.emptyHint')}</p>
        </div>
      </div>
    );
  }

  if (isLoading || article === undefined) {
    return (
      <div className={styles.rightPane}>
        <div className={styles.viewerBody}>
          <Skeleton className={styles.skelTitle} />
          <Skeleton className={styles.skelLine} />
          <Skeleton className={styles.skelLine} />
          <Skeleton className={styles.skelShort} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.rightPane}>
      <header className={styles.viewerHead}>
        <div className={styles.viewerMeta}>
          {article.tags.length > 0 ? (
            <div className={styles.viewerTags}>
              {article.tags.map((tag) => (
                <span key={tag} className={styles.viewerTag}>
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          <p className={styles.viewerUpdated}>
            {t('admin.kb.updatedAt', { date: article.updatedAt.slice(0, 10) })}
          </p>
        </div>
        <button type="button" className={styles.viewerEdit} onClick={onEdit}>
          <Icon name="edit" size={13} />
          {t('admin.kb.edit')}
        </button>
      </header>

      <div className={styles.viewerBody}>
        <KbMarkdown source={article.bodyMarkdown} onNavigate={onNavigate} />
      </div>

      {article.backlinks.length > 0 ? (
        <div className={styles.backlinks}>
          <p className={styles.backlinksLabel}>↩ {t('admin.kb.backlinks')}</p>
          <div className={styles.backlinksList}>
            {article.backlinks.map((link) => (
              <button
                key={link.slug}
                type="button"
                className={styles.backlink}
                onClick={() => onNavigate(link.slug)}
              >
                <Icon name="file" size={12} className={styles.backlinkIcon} />
                {link.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

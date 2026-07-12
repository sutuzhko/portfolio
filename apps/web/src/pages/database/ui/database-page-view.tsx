import { useTranslation } from 'react-i18next';

import type { ArticleDetail, DatabaseTree } from '@/entities/kb';
import { useReveal } from '@/shared/lib';
import { ErrorState, Heading, Icon, Text } from '@sutuzhko/ui-kit';
import { KbArticle } from '@/widgets/kb-article';
import { KbTree } from '@/widgets/kb-tree';

import styles from './database-page.module.css';

export interface DatabasePageViewProps {
  readonly tree: DatabaseTree | undefined;
  readonly article: ArticleDetail | undefined;
  readonly selectedSlug?: string;
  readonly isTreeLoading?: boolean;
  readonly isTreeError?: boolean;
  readonly isArticleLoading?: boolean;
  readonly isArticleError?: boolean;
  readonly onSelectArticle: (slug: string) => void;
  readonly onBack: () => void;
  readonly onRetryTree?: () => void;
  readonly onRetryArticle?: () => void;
}

/**
 * Презентационный экран базы знаний (макет `~/database`): дерево слева, читатель
 * статьи справа. Всё состояние приходит пропами, поэтому вид управляем и
 * документируется в Storybook. Ошибку дерева показываем на уровне страницы —
 * без него читать нечего; ошибку статьи — внутри читателя.
 */
export function DatabasePageView({
  tree,
  article,
  selectedSlug,
  isTreeLoading,
  isTreeError,
  isArticleLoading,
  isArticleError,
  onSelectArticle,
  onBack,
  onRetryTree,
  onRetryArticle,
}: DatabasePageViewProps) {
  const { t } = useTranslation();
  const revealRef = useReveal();

  return (
    <main className={styles.page} ref={revealRef}>
      <button type="button" className={styles.back} onClick={onBack}>
        <Icon name="arrow-right" size={14} className={styles.backIcon} />
        {t('database.back')}
      </button>

      <p className={styles.breadcrumb}>{t('database.breadcrumb')}</p>
      <Heading level="display" as="h1" className={styles.title}>
        {t('database.title')}
      </Heading>
      <Text as="p" tone="muted" className={styles.intro}>
        {t('database.intro')}
      </Text>

      {isTreeError ? (
        <ErrorState message={t('database.error')} onRetry={onRetryTree} />
      ) : (
        <div className={styles.grid}>
          <KbTree
            tree={isTreeLoading ? undefined : tree}
            selectedSlug={selectedSlug}
            onSelectArticle={onSelectArticle}
          />
          <KbArticle
            article={article}
            hasSelection={selectedSlug !== undefined}
            isLoading={isArticleLoading}
            isError={isArticleError}
            onNavigate={onSelectArticle}
            onRetry={onRetryArticle}
          />
        </div>
      )}
    </main>
  );
}

import { useTranslation } from 'react-i18next';

import type { ArticleLink } from '@/entities/kb';
import { Icon } from '@sutuzhko/ui-kit';

import styles from './kb-article.module.css';

export interface KbBacklinksProps {
  readonly backlinks: readonly ArticleLink[];
  readonly onNavigate: (slug: string) => void;
}

/** Блок «Ссылаются сюда» — статьи с вики-ссылкой на текущую (считает бэкенд). */
export function KbBacklinks({ backlinks, onNavigate }: KbBacklinksProps) {
  const { t } = useTranslation();

  if (backlinks.length === 0) return null;

  return (
    <div className={styles.backlinks}>
      <p className={styles.backlinksLabel}>{t('database.backlinks')}</p>
      <div className={styles.backlinksList}>
        {backlinks.map((link) => (
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
  );
}

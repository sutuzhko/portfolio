import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import { Icon } from '@sutuzhko/ui-kit';

import type { FolderOption } from '../model/kb-nodes';

import styles from './admin-kb.module.css';

export interface KbNodeMenuProps {
  readonly kind: 'folder' | 'article';
  /** Папки, куда можно переместить узел (без себя и своих потомков — для папок). */
  readonly moveTargets: readonly FolderOption[];
  readonly onRename: () => void;
  readonly onAddArticle: () => void;
  readonly onAddSubfolder: () => void;
  readonly onMove: (targetId: string) => void;
  readonly onDelete: () => void;
  readonly onClose: () => void;
}

/** Контекст-меню узла дерева: переименовать / (для папки) добавить / переместить / удалить. */
export function KbNodeMenu({
  kind,
  moveTargets,
  onRename,
  onAddArticle,
  onAddSubfolder,
  onMove,
  onDelete,
  onClose,
}: KbNodeMenuProps) {
  const { t } = useTranslation();
  const isFolder = kind === 'folder';

  return (
    <>
      {/* Ловушка клика по фону закрывает меню (как в макете). */}
      <button
        type="button"
        aria-label={t('admin.kb.cancel')}
        className={styles.menuCatcher}
        onClick={onClose}
      />
      <div className={styles.menu} role="menu">
        <button type="button" role="menuitem" className={styles.menuItem} onClick={onRename}>
          <Icon name="edit" size={13} />
          {t('admin.kb.rename')}
        </button>

        {isFolder ? (
          <>
            <button
              type="button"
              role="menuitem"
              className={styles.menuItem}
              onClick={onAddArticle}
            >
              <Icon name="plus" size={13} className={styles.menuAccent} />
              {t('admin.kb.articleHere')}
            </button>
            <button
              type="button"
              role="menuitem"
              className={styles.menuItem}
              onClick={onAddSubfolder}
            >
              <Icon name="folder" size={13} />
              {t('admin.kb.subfolder')}
            </button>
          </>
        ) : null}

        {moveTargets.length > 0 ? (
          <>
            <div className={styles.menuDivider} />
            <div className={styles.menuLabel}>{t('admin.kb.moveTo')}</div>
            <div className={styles.menuMoveList}>
              {moveTargets.map((target) => (
                <button
                  key={target.id}
                  type="button"
                  role="menuitem"
                  className={styles.menuMoveItem}
                  style={{ paddingLeft: 10 + target.depth * 12 }}
                  onClick={() => onMove(target.id)}
                >
                  {target.label}
                </button>
              ))}
            </div>
          </>
        ) : null}

        <div className={styles.menuDivider} />
        <button
          type="button"
          role="menuitem"
          className={cn(styles.menuItem, styles.menuDanger)}
          onClick={onDelete}
        >
          <Icon name="trash" size={13} />
          {t('admin.kb.delete')}
        </button>
      </div>
    </>
  );
}

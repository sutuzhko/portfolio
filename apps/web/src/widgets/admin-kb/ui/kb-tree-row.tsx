import { useEffect, useRef, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import { Icon } from '@sutuzhko/ui-kit';

import type { FolderOption, KbRow } from '../model/kb-nodes';

import { KbNodeMenu } from './kb-node-menu';
import styles from './admin-kb.module.css';

export interface KbTreeRowProps {
  readonly row: KbRow;
  readonly selected: boolean;
  readonly renaming: boolean;
  readonly renameValue: string;
  readonly menuOpen: boolean;
  readonly moveTargets: readonly FolderOption[];
  readonly onToggle: () => void;
  readonly onSelect: () => void;
  readonly onOpenMenu: () => void;
  readonly onCloseMenu: () => void;
  readonly onRenameChange: (value: string) => void;
  readonly onRenameCommit: () => void;
  readonly onRenameCancel: () => void;
  readonly onStartRename: () => void;
  readonly onAddArticle: () => void;
  readonly onAddSubfolder: () => void;
  readonly onMove: (targetId: string) => void;
  readonly onDelete: () => void;
}

/** Одна строка дерева библиотеки: папка (свернуть/раскрыть) или статья (выбрать), с ⋮-меню и инлайн-переименованием. */
export function KbTreeRow({
  row,
  selected,
  renaming,
  renameValue,
  menuOpen,
  moveTargets,
  onToggle,
  onSelect,
  onOpenMenu,
  onCloseMenu,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
  onStartRename,
  onAddArticle,
  onAddSubfolder,
  onMove,
  onDelete,
}: KbTreeRowProps) {
  const { t } = useTranslation();
  const pad = row.depth * 16 + 8;
  const isFolder = row.kind === 'folder';
  const inputRef = useRef<HTMLInputElement>(null);
  // Фокус в поле, как только строка перешла в режим переименования.
  useEffect(() => {
    if (renaming) inputRef.current?.focus();
  }, [renaming]);

  const onRenameKey = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onRenameCommit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onRenameCancel();
    }
  };

  if (renaming) {
    return (
      <div className={styles.renameRow} style={{ paddingLeft: pad }}>
        <input
          ref={inputRef}
          value={renameValue}
          aria-label={t('admin.kb.rename')}
          className={styles.renameInput}
          onChange={(event) => onRenameChange(event.target.value)}
          onKeyDown={onRenameKey}
        />
        <button
          type="button"
          className={styles.renameCommit}
          aria-label={t('admin.kb.rename')}
          onClick={onRenameCommit}
        >
          <Icon name="success" size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.nodeWrap}>
      <div className={cn(styles.node, selected && styles.nodeSelected)}>
        {isFolder ? (
          <button
            type="button"
            className={styles.nodeMain}
            style={{ paddingLeft: pad }}
            aria-expanded={row.expanded}
            onClick={onToggle}
          >
            <Icon
              name="chevron-right"
              size={12}
              className={cn(styles.caret, row.expanded && styles.caretOpen)}
            />
            <Icon name="folder" size={15} className={styles.folderIcon} />
            <span className={styles.nodeLabel}>{row.label}</span>
            <span className={styles.nodeCount}>{row.count}</span>
          </button>
        ) : (
          <button
            type="button"
            className={cn(styles.nodeMain, selected && styles.nodeMainSelected)}
            style={{ paddingLeft: pad }}
            onClick={onSelect}
          >
            <Icon name="file" size={13} className={styles.fileIcon} />
            <span className={styles.nodeLabel}>{row.label}</span>
          </button>
        )}
        <button
          type="button"
          className={styles.nodeMenuBtn}
          aria-label={t('admin.kb.actions')}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={onOpenMenu}
        >
          <Icon name="kebab" size={15} />
        </button>
      </div>
      {menuOpen ? (
        <KbNodeMenu
          kind={row.kind}
          moveTargets={moveTargets}
          onRename={onStartRename}
          onAddArticle={onAddArticle}
          onAddSubfolder={onAddSubfolder}
          onMove={onMove}
          onDelete={onDelete}
          onClose={onCloseMenu}
        />
      ) : null}
    </div>
  );
}

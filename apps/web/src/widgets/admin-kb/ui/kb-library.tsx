import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { DatabaseTree } from '@/entities/kb';
import { Icon } from '@sutuzhko/ui-kit';

import { countArticles, countFolders, flattenTree, folderOptions } from '../model/kb-nodes';

import { KbTreeRow } from './kb-tree-row';
import styles from './admin-kb.module.css';

export interface KbLibraryProps {
  readonly tree: DatabaseTree;
  readonly selectedSlug: string | null;
  readonly onSelectArticle: (slug: string) => void;
  /** Открыть редактор новой статьи (в папке или в корне при `null`). */
  readonly onNewArticle: (folderId: string | null) => void;
  readonly onCreateFolder: (name: string, parentId: string | null) => void;
  readonly onRenameFolder: (id: string, name: string) => void;
  readonly onRenameArticle: (id: string, title: string) => void;
  readonly onMoveFolder: (id: string, targetId: string) => void;
  readonly onMoveArticle: (id: string, targetId: string) => void;
  readonly onDeleteFolder: (id: string, label: string) => void;
  readonly onDeleteArticle: (id: string, slug: string, label: string) => void;
}

interface RenameState {
  readonly id: string;
  readonly kind: 'folder' | 'article';
  readonly value: string;
  /** Исходное имя — чтобы не слать мутацию, если ничего не изменилось. */
  readonly original: string;
}

interface NewFolderState {
  readonly name: string;
  readonly parentId: string;
}

/** Левая панель БЗ: шапка со счётчиками и кнопками, форма новой папки и дерево. */
export function KbLibrary({
  tree,
  selectedSlug,
  onSelectArticle,
  onNewArticle,
  onCreateFolder,
  onRenameFolder,
  onRenameArticle,
  onMoveFolder,
  onMoveArticle,
  onDeleteFolder,
  onDeleteArticle,
}: KbLibraryProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => new Set(tree.folders.map((folder) => folder.id)),
  );
  const [menuId, setMenuId] = useState<string | null>(null);
  const [rename, setRename] = useState<RenameState | null>(null);
  const [newFolder, setNewFolder] = useState<NewFolderState | null>(null);

  const rows = useMemo(() => flattenTree(tree, expanded), [tree, expanded]);
  const folders = useMemo(() => folderOptions(tree), [tree]);

  const newFolderInputRef = useRef<HTMLInputElement>(null);
  const isNewFolderOpen = newFolder !== null;
  // Фокус в поле имени, как только форма новой папки раскрылась.
  useEffect(() => {
    if (isNewFolderOpen) newFolderInputRef.current?.focus();
  }, [isNewFolderOpen]);

  const toggle = (id: string): void =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const commitRename = (): void => {
    if (rename === null) return;
    const value = rename.value.trim();
    // Шлём мутацию только при реальном изменении непустого имени.
    if (value.length > 0 && value !== rename.original) {
      if (rename.kind === 'folder') onRenameFolder(rename.id, value);
      else onRenameArticle(rename.id, value);
    }
    setRename(null);
  };

  const submitNewFolder = (): void => {
    if (newFolder === null) return;
    const name = newFolder.name.trim();
    if (name.length === 0) return;
    onCreateFolder(name, newFolder.parentId === '' ? null : newFolder.parentId);
    setNewFolder(null);
  };

  const onNewFolderKey = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitNewFolder();
    } else if (event.key === 'Escape') {
      setNewFolder(null);
    }
  };

  return (
    <aside className={styles.library}>
      <header className={styles.libraryHead}>
        <div className={styles.libraryTitleBox}>
          <p className={styles.libraryTitle}>{t('admin.kb.library')}</p>
          <p className={styles.libraryCount}>
            {t('admin.kb.libraryCount', {
              folders: countFolders(tree),
              articles: countArticles(tree),
            })}
          </p>
        </div>
        <div className={styles.libraryActions}>
          <button
            type="button"
            className={styles.libraryGhostBtn}
            aria-label={t('admin.kb.newFolder')}
            title={t('admin.kb.newFolder')}
            onClick={() => setNewFolder({ name: '', parentId: '' })}
          >
            <Icon name="folder" size={15} />
          </button>
          <button
            type="button"
            className={styles.libraryAddBtn}
            aria-label={t('admin.kb.newArticle')}
            title={t('admin.kb.newArticle')}
            onClick={() => onNewArticle(null)}
          >
            <Icon name="plus" size={15} />
          </button>
        </div>
      </header>

      {newFolder !== null ? (
        <div className={styles.newFolder}>
          <input
            ref={newFolderInputRef}
            value={newFolder.name}
            placeholder={t('admin.kb.folderNamePlaceholder')}
            aria-label={t('admin.kb.newFolder')}
            className={styles.newFolderInput}
            onChange={(event) => setNewFolder({ ...newFolder, name: event.target.value })}
            onKeyDown={onNewFolderKey}
          />
          <select
            value={newFolder.parentId}
            aria-label={t('admin.kb.folderLabel')}
            className={styles.newFolderSelect}
            onChange={(event) => setNewFolder({ ...newFolder, parentId: event.target.value })}
          >
            <option value="">{t('admin.kb.parentRoot')}</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {' '.repeat(folder.depth * 2)}
                {folder.label}
              </option>
            ))}
          </select>
          <div className={styles.newFolderButtons}>
            <button type="button" className={styles.newFolderCreate} onClick={submitNewFolder}>
              {t('admin.kb.create')}
            </button>
            <button
              type="button"
              className={styles.newFolderCancel}
              onClick={() => setNewFolder(null)}
            >
              {t('admin.kb.cancel')}
            </button>
          </div>
        </div>
      ) : null}

      <div className={styles.tree}>
        {rows.map((row) => (
          <KbTreeRow
            key={`${row.kind}-${row.id}`}
            row={row}
            selected={row.kind === 'article' && row.slug === selectedSlug}
            renaming={rename?.id === row.id}
            renameValue={rename?.id === row.id ? rename.value : ''}
            menuOpen={menuId === row.id}
            moveTargets={folders.filter(
              (folder) =>
                folder.id !== row.id &&
                folder.id !== (row.kind === 'folder' ? row.parentId : row.folderId),
            )}
            onToggle={() => toggle(row.id)}
            onSelect={() => row.kind === 'article' && onSelectArticle(row.slug)}
            onOpenMenu={() => setMenuId(row.id)}
            onCloseMenu={() => setMenuId(null)}
            onRenameChange={(value) => setRename((prev) => (prev ? { ...prev, value } : prev))}
            onRenameCommit={commitRename}
            onRenameCancel={() => setRename(null)}
            onStartRename={() => {
              setMenuId(null);
              setRename({ id: row.id, kind: row.kind, value: row.label, original: row.label });
            }}
            onAddArticle={() => {
              setMenuId(null);
              onNewArticle(row.id);
            }}
            onAddSubfolder={() => {
              setMenuId(null);
              setNewFolder({ name: '', parentId: row.id });
            }}
            onMove={(targetId) => {
              setMenuId(null);
              if (row.kind === 'folder') onMoveFolder(row.id, targetId);
              else onMoveArticle(row.id, targetId);
            }}
            onDelete={() => {
              setMenuId(null);
              if (row.kind === 'folder') onDeleteFolder(row.id, row.label);
              else onDeleteArticle(row.id, row.slug, row.label);
            }}
          />
        ))}
      </div>
    </aside>
  );
}

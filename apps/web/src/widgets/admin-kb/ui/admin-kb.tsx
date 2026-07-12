import { skipToken } from '@reduxjs/toolkit/query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useCreateArticleMutation,
  useCreateFolderMutation,
  useDeleteArticleMutation,
  useDeleteFolderMutation,
  useGetArticleAdminQuery,
  useGetArticleQuery,
  useGetDatabaseTreeQuery,
  useGetFoldersQuery,
  useLazyGetArticleAdminQuery,
  useUpdateArticleMutation,
  useUpdateFolderMutation,
} from '@/entities/kb';
import { useToaster } from '@/features/toaster';
import type { AppLanguage } from '@/shared/config';
import { ConfirmDialog, ErrorState } from '@sutuzhko/ui-kit';

import {
  articleToForm,
  emptyArticleForm,
  formToCreate,
  formToUpdate,
  mergeLocalizedText,
  type ArticleFormValues,
} from '../model/article-form';
import { findArticleIdBySlug, folderOptions } from '../model/kb-nodes';

import { AdminKbSkeleton } from './admin-kb-skeleton';
import { AdminKbView } from './admin-kb-view';
import { KbArticleEditor } from './kb-article-editor';
import { KbArticleViewer } from './kb-article-viewer';
import { KbLibrary } from './kb-library';

export interface AdminKbProps {
  /** Активная локаль редактирования (из маршрута кабинета). */
  readonly locale: AppLanguage;
}

type EditorState =
  | { readonly mode: 'closed' }
  | { readonly mode: 'new'; readonly folderId: string }
  | { readonly mode: 'edit'; readonly id: string };

type PendingDelete =
  | { readonly kind: 'folder'; readonly id: string; readonly label: string }
  | {
      readonly kind: 'article';
      readonly id: string;
      readonly slug: string;
      readonly label: string;
    };

// Достаём HTTP-статус из ошибки baseQuery, не приводя типы.
function statusOf(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const { status } = error;
    if (typeof status === 'number') return status;
  }
  return undefined;
}

/**
 * Контейнер вкладки «База знаний»: дерево + просмотр/редактор статьи. Данные и
 * мутации — из `entities/kb` (мутации инвалидируют тег `Kb`, дерево и статья сами
 * обновляются). UI-состояние дерева (раскрытие, меню, переименование) живёт в
 * `KbLibrary`; здесь — выбор, режим редактора и подтверждение удаления.
 */
export function AdminKb({ locale }: AdminKbProps) {
  const { t } = useTranslation();
  const { notify } = useToaster();

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>({ mode: 'closed' });
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [slugError, setSlugError] = useState<string | undefined>(undefined);

  const treeQuery = useGetDatabaseTreeQuery(locale);
  const foldersQuery = useGetFoldersQuery();
  const articleQuery = useGetArticleQuery(
    selectedSlug !== null ? { slug: selectedSlug, language: locale } : skipToken,
  );
  const editAdminQuery = useGetArticleAdminQuery(editor.mode === 'edit' ? editor.id : skipToken);
  const [fetchArticleAdmin] = useLazyGetArticleAdminQuery();

  const [createFolder] = useCreateFolderMutation();
  const [updateFolder] = useUpdateFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();
  const [createArticle, createState] = useCreateArticleMutation();
  const [updateArticle, updateState] = useUpdateArticleMutation();
  const [deleteArticle] = useDeleteArticleMutation();

  const isSaving = createState.isLoading || updateState.isLoading;
  const ok = (): void => {
    notify({ type: 'success', title: t('admin.saved') });
  };
  const fail = (key = 'admin.saveError'): void => {
    notify({ type: 'error', title: t(key) });
  };
  const run = async (promise: Promise<unknown>): Promise<void> => {
    try {
      await promise;
      ok();
    } catch {
      fail();
    }
  };

  const selectArticle = (slug: string): void => {
    setSelectedSlug(slug);
    setEditor({ mode: 'closed' });
  };

  const newArticle = (folderId: string | null): void => {
    setSlugError(undefined);
    setEditor({ mode: 'new', folderId: folderId ?? '' });
  };

  const editSelected = (): void => {
    if (treeQuery.data === undefined || selectedSlug === null) return;
    const id = findArticleIdBySlug(treeQuery.data, selectedSlug);
    if (id !== null) {
      setSlugError(undefined);
      setEditor({ mode: 'edit', id });
    }
  };

  const saveArticle = async (values: ArticleFormValues): Promise<void> => {
    setSlugError(undefined);
    try {
      if (editor.mode === 'new') {
        await createArticle(formToCreate(values, locale)).unwrap();
      } else if (editor.mode === 'edit' && editAdminQuery.data !== undefined) {
        await updateArticle({
          id: editor.id,
          body: formToUpdate(values, locale, editAdminQuery.data),
        }).unwrap();
      } else {
        return;
      }
      setSelectedSlug(values.slug.trim());
      setEditor({ mode: 'closed' });
      ok();
    } catch (error) {
      if (statusOf(error) === 409) setSlugError(t('admin.kb.slugTaken'));
      else fail();
    }
  };

  const renameFolder = (id: string, name: string): void => {
    const base = foldersQuery.data?.find((folder) => folder.id === id);
    void run(
      updateFolder({ id, body: { name: mergeLocalizedText(name, locale, base?.name) } }).unwrap(),
    );
  };

  const renameArticle = async (id: string, title: string): Promise<void> => {
    try {
      const base = await fetchArticleAdmin(id).unwrap();
      await updateArticle({
        id,
        body: { title: mergeLocalizedText(title, locale, base.title) },
      }).unwrap();
      ok();
    } catch {
      fail();
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (pendingDelete === null) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      if (target.kind === 'folder') {
        await deleteFolder(target.id).unwrap();
      } else {
        await deleteArticle(target.id).unwrap();
        if (selectedSlug === target.slug) {
          setSelectedSlug(null);
          setEditor({ mode: 'closed' });
        }
      }
      ok();
    } catch (error) {
      fail(
        target.kind === 'folder' && statusOf(error) === 400
          ? 'admin.kb.notEmpty'
          : 'admin.saveError',
      );
    }
  };

  if (treeQuery.isError) {
    return <ErrorState message={t('admin.loadError')} onRetry={() => void treeQuery.refetch()} />;
  }
  if (treeQuery.isLoading || treeQuery.data === undefined) {
    return <AdminKbSkeleton />;
  }

  const tree = treeQuery.data;
  const folders = folderOptions(tree);
  const editorReady =
    editor.mode === 'new' || (editor.mode === 'edit' && editAdminQuery.data !== undefined);

  const main =
    editor.mode !== 'closed' ? (
      editorReady ? (
        <KbArticleEditor
          key={editor.mode === 'edit' ? `edit-${editor.id}` : `new-${editor.folderId}`}
          mode={editor.mode === 'edit' ? 'edit' : 'new'}
          initial={
            editor.mode === 'edit' && editAdminQuery.data !== undefined
              ? articleToForm(editAdminQuery.data, locale)
              : emptyArticleForm(editor.mode === 'new' ? editor.folderId : '')
          }
          folders={folders}
          isSaving={isSaving}
          serverSlugError={slugError}
          onSave={(values) => void saveArticle(values)}
          onCancel={() => {
            setEditor({ mode: 'closed' });
            setSlugError(undefined);
          }}
        />
      ) : (
        <KbArticleViewer
          article={undefined}
          hasSelection
          isLoading
          onEdit={() => undefined}
          onNavigate={() => undefined}
        />
      )
    ) : (
      <KbArticleViewer
        article={articleQuery.data}
        hasSelection={selectedSlug !== null}
        isLoading={articleQuery.isFetching}
        onEdit={editSelected}
        onNavigate={selectArticle}
      />
    );

  return (
    <>
      <AdminKbView
        library={
          <KbLibrary
            tree={tree}
            selectedSlug={selectedSlug}
            onSelectArticle={selectArticle}
            onNewArticle={newArticle}
            onCreateFolder={(name, parentId) =>
              void run(
                createFolder({
                  name: { ru: name, en: name },
                  parentId: parentId ?? undefined,
                }).unwrap(),
              )
            }
            onRenameFolder={renameFolder}
            onRenameArticle={(id, title) => void renameArticle(id, title)}
            onMoveFolder={(id, targetId) =>
              void run(updateFolder({ id, body: { parentId: targetId } }).unwrap())
            }
            onMoveArticle={(id, targetId) =>
              void run(updateArticle({ id, body: { folderId: targetId } }).unwrap())
            }
            onDeleteFolder={(id, label) => setPendingDelete({ kind: 'folder', id, label })}
            onDeleteArticle={(id, slug, label) =>
              setPendingDelete({ kind: 'article', id, slug, label })
            }
          />
        }
        main={main}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t('admin.kb.delete')}
        message={
          pendingDelete !== null
            ? t(
                pendingDelete.kind === 'folder'
                  ? 'admin.kb.deleteFolderText'
                  : 'admin.kb.deleteArticleText',
                { name: pendingDelete.label },
              )
            : ''
        }
        confirmLabel={t('admin.kb.delete')}
        cancelLabel={t('admin.kb.cancel')}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

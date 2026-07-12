import type { ArticleStub, DatabaseTree, FolderNode } from '@/entities/kb';
import type { TreeNode } from '@sutuzhko/ui-kit';

function articleToNode(article: ArticleStub): TreeNode {
  return { id: article.slug, label: article.title, type: 'article' };
}

function folderToNode(folder: FolderNode): TreeNode {
  return {
    id: folder.id,
    label: folder.name,
    type: 'folder',
    count: folder.articles.length,
    // Вложенные папки — выше статей (как в дереве файлов).
    children: [...folder.children.map(folderToNode), ...folder.articles.map(articleToNode)],
  };
}

/** Разворачивает дерево БЗ в узлы UI-kit `Tree`: папки сверху, статьи корня — под ними. */
export function toTreeNodes(tree: DatabaseTree): TreeNode[] {
  return [...tree.folders.map(folderToNode), ...tree.rootArticles.map(articleToNode)];
}

/** Id папок верхнего уровня — чтобы раскрыть их по умолчанию (статьи сразу видны). */
export function topLevelFolderIds(tree: DatabaseTree): string[] {
  return tree.folders.map((folder) => folder.id);
}

import type { DatabaseTree } from '@/entities/kb';

/** Slug первой статьи дерева (корневые — приоритетнее) для автовыбора при загрузке. */
export function firstArticleSlug(tree: DatabaseTree): string | undefined {
  const [rootArticle] = tree.rootArticles;
  if (rootArticle !== undefined) return rootArticle.slug;

  for (const folder of tree.folders) {
    const [article] = folder.articles;
    if (article !== undefined) return article.slug;
  }

  return undefined;
}

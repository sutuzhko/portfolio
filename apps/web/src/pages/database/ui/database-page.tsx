import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useArticle, useDatabaseTree } from '@/entities/kb';
import { routePaths } from '@/shared/config';

import { firstArticleSlug } from '../model/first-article';

import { DatabasePageView } from './database-page-view';

/**
 * Контейнер базы знаний: держит выбранную статью (по slug), тянет дерево и саму
 * статью, оркеструет переходы (клик по дереву, вики-ссылке, бэклинку). При первой
 * загрузке дерева автоматически открывает первую статью — экран не пустует.
 */
export function DatabasePage() {
  const navigate = useNavigate();
  const {
    data: tree,
    isLoading: isTreeLoading,
    isError: isTreeError,
    refetch: refetchTree,
  } = useDatabaseTree();
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(undefined);
  const {
    data: article,
    isFetching: isArticleFetching,
    isError: isArticleError,
    refetch: refetchArticle,
  } = useArticle(selectedSlug);

  useEffect(() => {
    if (selectedSlug === undefined && tree !== undefined) {
      setSelectedSlug(firstArticleSlug(tree));
    }
  }, [tree, selectedSlug]);

  return (
    <DatabasePageView
      tree={tree}
      article={article}
      selectedSlug={selectedSlug}
      isTreeLoading={isTreeLoading}
      isTreeError={isTreeError}
      isArticleLoading={isArticleFetching}
      isArticleError={isArticleError}
      onSelectArticle={setSelectedSlug}
      onBack={() => void navigate(routePaths.home)}
      onRetryTree={() => void refetchTree()}
      onRetryArticle={() => void refetchArticle()}
    />
  );
}

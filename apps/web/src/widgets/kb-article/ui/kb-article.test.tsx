import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import type { ArticleDetail } from '@/entities/kb';

import { KbArticle } from './kb-article';

const article: ArticleDetail = {
  slug: 'ts-generics',
  title: 'Дженерики',
  tags: ['typescript', 'types'],
  status: 'PUBLISHED',
  updatedAt: '2026-07-01T16:45:00.000Z',
  breadcrumb: ['TypeScript', 'Дженерики'],
  backlinks: [{ slug: 'react-hooks', title: 'Хуки React' }],
  bodyMarkdown: 'Пример пользы — типобезопасные хуки, см. [[react-hooks]].',
};

describe('KbArticle', () => {
  it('без выбора показывает приглашение', () => {
    renderWithProviders(
      <KbArticle article={undefined} hasSelection={false} onNavigate={vi.fn()} />,
    );
    expect(screen.getByText('Выберите статью в дереве слева')).toBeInTheDocument();
  });

  it('рендерит крошки, теги, тело и бэклинки', () => {
    renderWithProviders(<KbArticle article={article} hasSelection onNavigate={vi.fn()} />);

    expect(screen.getByText('TypeScript / Дженерики')).toBeInTheDocument();
    expect(screen.getByText('#typescript')).toBeInTheDocument();
    expect(screen.getByText(/типобезопасные хуки/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Хуки React' })).toBeInTheDocument();
  });

  it('клик по бэклинку и вики-ссылке ведёт к другой статье', async () => {
    const onNavigate = vi.fn();
    renderWithProviders(<KbArticle article={article} hasSelection onNavigate={onNavigate} />);

    // Вики-ссылка [[react-hooks]] в тексте.
    await userEvent.click(screen.getByRole('button', { name: 'react-hooks' }));
    expect(onNavigate).toHaveBeenCalledWith('react-hooks');

    // Бэклинк с заголовком статьи.
    await userEvent.click(screen.getByRole('button', { name: 'Хуки React' }));
    expect(onNavigate).toHaveBeenCalledWith('react-hooks');
  });

  it('во время загрузки — скелетон, при ошибке — карточка ошибки', () => {
    const loading = renderWithProviders(
      <KbArticle article={undefined} hasSelection isLoading onNavigate={vi.fn()} />,
    );
    expect(loading.container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    loading.unmount();

    renderWithProviders(
      <KbArticle article={undefined} hasSelection isError onNavigate={vi.fn()} onRetry={vi.fn()} />,
    );
    expect(screen.getByText('Не удалось загрузить базу знаний')).toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(
      <KbArticle article={article} hasSelection onNavigate={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

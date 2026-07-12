import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockArticle } from '@/entities/kb/mocks';

import { KbArticleViewer } from './kb-article-viewer';

function renderViewer(overrides: Partial<Parameters<typeof KbArticleViewer>[0]> = {}) {
  return renderWithProviders(
    <KbArticleViewer
      article={mockArticle}
      hasSelection
      isLoading={false}
      onEdit={vi.fn()}
      onNavigate={vi.fn()}
      {...overrides}
    />,
  );
}

describe('KbArticleViewer', () => {
  it('без выбора показывает приглашающее пустое состояние', () => {
    renderViewer({ hasSelection: false, article: undefined });
    expect(screen.getByText('Статья не выбрана')).toBeInTheDocument();
  });

  it('показывает теги, дату и тело выбранной статьи', () => {
    renderViewer();
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText(/обновлено/)).toBeInTheDocument();
    // «## Правила хуков» из тела рендерится заголовком.
    expect(screen.getByText('Правила хуков')).toBeInTheDocument();
  });

  it('кнопка «Редактировать» вызывает onEdit', async () => {
    const onEdit = vi.fn();
    renderViewer({ onEdit });
    await userEvent.click(screen.getByRole('button', { name: /Редактировать/ }));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('клик по бэклинку зовёт onNavigate со slug', async () => {
    const onNavigate = vi.fn();
    renderViewer({ onNavigate });
    await userEvent.click(screen.getByRole('button', { name: /О базе знаний/ }));
    expect(onNavigate).toHaveBeenCalledWith('welcome');
  });

  it('не нарушает доступность', async () => {
    const { container } = renderViewer();
    expect(await axe(container)).toHaveNoViolations();
  });
});

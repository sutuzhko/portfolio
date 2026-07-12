import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/app/test/render';

import { About } from './ui/about';

const BIO = [
  'Первый абзац о себе.',
  'Сейчас в [Go Mobile](https://gomobile.ru) — продукты и UI-kit.',
].join('\n\n');

describe('About', () => {
  it('рендерит локализованный заголовок секции', () => {
    renderWithProviders(<About bioMarkdown={BIO} />);
    expect(screen.getByRole('heading', { name: '// обо мне' })).toBeInTheDocument();
  });

  it('рендерит Markdown-абзацы и внешнюю ссылку в новой вкладке', () => {
    renderWithProviders(<About bioMarkdown={BIO} />);
    expect(screen.getByText('Первый абзац о себе.')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Go Mobile' });
    expect(link).toHaveAttribute('href', 'https://gomobile.ru');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('во время загрузки показывает скелетон вместо текста', () => {
    renderWithProviders(<About isLoading />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('Первый абзац о себе.')).not.toBeInTheDocument();
    // Заголовок секции остаётся — грузится только текст.
    expect(screen.getByRole('heading', { name: '// обо мне' })).toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderWithProviders(<About bioMarkdown={BIO} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

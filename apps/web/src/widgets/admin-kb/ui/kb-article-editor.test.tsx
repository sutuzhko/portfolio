import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockDatabaseTree } from '@/entities/kb/mocks';

import { folderOptions } from '../model/kb-nodes';

import { KbArticleEditor } from './kb-article-editor';

const folders = folderOptions(mockDatabaseTree);

function renderEditor(overrides: Partial<Parameters<typeof KbArticleEditor>[0]> = {}) {
  return renderWithProviders(
    <KbArticleEditor
      mode="new"
      initial={{ title: '', slug: '', body: '', folderId: '' }}
      folders={folders}
      isSaving={false}
      onSave={vi.fn()}
      onCancel={vi.fn()}
      {...overrides}
    />,
  );
}

describe('KbArticleEditor', () => {
  it('бар сохранения скрыт, пока форма не изменена, и появляется после правки', async () => {
    renderEditor();
    // Пока правок нет — бара сохранения нет (выйти можно кнопкой «Закрыть»).
    expect(screen.queryByRole('button', { name: /Сохранить/ })).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Заголовок', { exact: false }), 'Черновик');
    expect(await screen.findByRole('button', { name: /Сохранить/ })).toBeEnabled();
  });

  it('пустые обязательные поля не дают сохранить и показывают ошибку', async () => {
    const onSave = vi.fn();
    renderEditor({ onSave });
    // Делаем форму «грязной» правкой заголовка, но slug/тело пустые.
    await userEvent.type(screen.getByLabelText('Заголовок', { exact: false }), 'Только заголовок');
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Укажите slug')).toBeInTheDocument();
  });

  it('корректная форма вызывает onSave со значениями активной локали', async () => {
    const onSave = vi.fn();
    renderEditor({ onSave });
    await userEvent.type(screen.getByLabelText('Заголовок', { exact: false }), 'Заголовок');
    await userEvent.type(screen.getByLabelText(/^Slug/), 'my-slug');
    await userEvent.type(screen.getByLabelText('MARKDOWN', { exact: false }), 'Тело статьи');
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0]?.[0]).toMatchObject({
      title: 'Заголовок',
      slug: 'my-slug',
      body: 'Тело статьи',
    });
  });

  it('переключение split / preview скрывает исходник', async () => {
    const { container } = renderEditor();
    expect(container.querySelector('textarea')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'preview' }));
    expect(container.querySelector('textarea')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'split' }));
    expect(container.querySelector('textarea')).toBeInTheDocument();
  });

  it('серверная ошибка slug выводится под полем', () => {
    renderEditor({ serverSlugError: 'Такой slug уже занят' });
    expect(screen.getByText('Такой slug уже занят')).toBeInTheDocument();
  });

  it('«Отмена» вызывает onCancel', async () => {
    const onCancel = vi.fn();
    renderEditor({ onCancel });
    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderEditor();
    expect(await axe(container)).toHaveNoViolations();
  });
});

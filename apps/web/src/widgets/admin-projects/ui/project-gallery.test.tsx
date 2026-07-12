import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ProjectMediaAdmin } from '@/entities/project';
import { renderWithProviders } from '@/app/test/render';

import { ProjectGallery } from './project-gallery';

function makeShot(id: string): ProjectMediaAdmin {
  return {
    id,
    url: `data:image/svg+xml,${id}`,
    type: 'GALLERY',
    alt: { ru: 'Экран 1', en: null },
    width: 640,
    height: 400,
    mime: 'image/png',
    size: 100,
    formats: null,
    order: 0,
    projectId: 'p1',
  };
}

const shots: ProjectMediaAdmin[] = [makeShot('m1')];

/** Файл с заданным размером без реальной аллокации байтов. */
function fileOfSize(name: string, size: number): File {
  const file = new File(['x'], name, { type: 'image/png' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function renderGallery(overrides: Partial<Parameters<typeof ProjectGallery>[0]> = {}) {
  return renderWithProviders(
    <ProjectGallery
      gallery={shots}
      locale="ru"
      disabled={false}
      onUpload={vi.fn()}
      onReject={vi.fn()}
      onDelete={vi.fn()}
      onCopyUrl={vi.fn()}
      {...overrides}
    />,
  );
}

function fileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) throw new Error('file input not found');
  return input;
}

describe('ProjectGallery', () => {
  it('показывает загруженные скриншоты с локализованным alt', () => {
    renderGallery();
    expect(screen.getByRole('img', { name: 'Экран 1' })).toHaveAttribute('src', shots[0]?.url);
  });

  it('пустая галерея показывает только плитку загрузки', () => {
    renderGallery({ gallery: [] });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Загрузить/ })).toBeInTheDocument();
  });

  it('удаление зовёт onDelete с id скриншота', async () => {
    const onDelete = vi.fn();
    renderGallery({ onDelete });
    await userEvent.click(screen.getByRole('button', { name: 'Удалить скриншот' }));
    expect(onDelete).toHaveBeenCalledWith('m1');
  });

  it('копирование зовёт onCopyUrl с url скриншота', async () => {
    const onCopyUrl = vi.fn();
    renderGallery({ onCopyUrl });
    await userEvent.click(screen.getByRole('button', { name: 'Скопировать ссылку' }));
    expect(onCopyUrl).toHaveBeenCalledWith(shots[0]?.url);
  });

  it('выбор нескольких файлов зовёт onUpload пачкой', async () => {
    const onUpload = vi.fn();
    const { container } = renderGallery({ gallery: [], onUpload });
    const a = new File(['a'], 'a.png', { type: 'image/png' });
    const b = new File(['b'], 'b.png', { type: 'image/png' });
    await userEvent.upload(fileInput(container), [a, b]);
    expect(onUpload).toHaveBeenCalledWith([a, b]);
  });

  it('слишком большой файл пропускается и попадает в onReject', async () => {
    const onUpload = vi.fn();
    const onReject = vi.fn();
    const { container } = renderGallery({ gallery: [], onUpload, onReject });
    const big = fileOfSize('big.png', 9 * 1024 * 1024);
    await userEvent.upload(fileInput(container), big);
    expect(onUpload).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledWith({ tooLarge: 1, overflow: 0 });
  });

  it('при заполненной галерее кнопка загрузки заблокирована', () => {
    const full = Array.from({ length: 10 }, (_, i) => makeShot(`m${i}`));
    renderGallery({ gallery: full });
    expect(screen.getByRole('button', { name: /Лимит достигнут/ })).toBeDisabled();
  });
});

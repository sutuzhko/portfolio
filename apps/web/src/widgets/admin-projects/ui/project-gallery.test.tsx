import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ProjectMediaAdmin } from '@/entities/project';
import { renderWithProviders } from '@/app/test/render';

import { ProjectGallery } from './project-gallery';

const shots: ProjectMediaAdmin[] = [
  {
    id: 'm1',
    url: 'data:image/svg+xml,shot1',
    type: 'GALLERY',
    alt: { ru: 'Экран 1', en: null },
    width: 640,
    height: 400,
    mime: 'image/png',
    size: 100,
    formats: null,
    order: 0,
    projectId: 'p1',
  },
];

describe('ProjectGallery', () => {
  it('показывает загруженные скриншоты с локализованным alt', () => {
    renderWithProviders(
      <ProjectGallery
        gallery={shots}
        locale="ru"
        disabled={false}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
        onCopyUrl={vi.fn()}
      />,
    );
    expect(screen.getByRole('img', { name: 'Экран 1' })).toHaveAttribute('src', shots[0]?.url);
  });

  it('пустое состояние подсказывает, что видео/GIF будут позже', () => {
    renderWithProviders(
      <ProjectGallery
        gallery={[]}
        locale="ru"
        disabled={false}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
        onCopyUrl={vi.fn()}
      />,
    );
    expect(screen.getByText(/Видео и GIF/i)).toBeInTheDocument();
  });

  it('удаление зовёт onDelete с id скриншота', async () => {
    const onDelete = vi.fn();
    renderWithProviders(
      <ProjectGallery
        gallery={shots}
        locale="ru"
        disabled={false}
        onUpload={vi.fn()}
        onDelete={onDelete}
        onCopyUrl={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Удалить скриншот' }));
    expect(onDelete).toHaveBeenCalledWith('m1');
  });

  it('копирование зовёт onCopyUrl с url скриншота', async () => {
    const onCopyUrl = vi.fn();
    renderWithProviders(
      <ProjectGallery
        gallery={shots}
        locale="ru"
        disabled={false}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
        onCopyUrl={onCopyUrl}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Скопировать ссылку' }));
    expect(onCopyUrl).toHaveBeenCalledWith(shots[0]?.url);
  });

  it('выбор файла зовёт onUpload', async () => {
    const onUpload = vi.fn();
    const { container } = renderWithProviders(
      <ProjectGallery
        gallery={[]}
        locale="ru"
        disabled={false}
        onUpload={onUpload}
        onDelete={vi.fn()}
        onCopyUrl={vi.fn()}
      />,
    );
    const input = container.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) throw new Error('file input not found');
    const file = new File(['x'], 'shot.png', { type: 'image/png' });
    await userEvent.upload(input, file);
    expect(onUpload).toHaveBeenCalledWith(file);
  });
});

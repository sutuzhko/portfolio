import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockProfileAdmin } from '@/entities/profile/mocks';
import type { UpdateProfile } from '@/entities/profile';

import { AdminProfileView } from './admin-profile-view';

function renderView(props: Partial<ComponentProps<typeof AdminProfileView>> = {}) {
  return renderWithProviders(
    <AdminProfileView
      profile={mockProfileAdmin}
      locale="ru"
      isSaving={false}
      onSave={vi.fn()}
      onUploadAvatar={vi.fn(() => Promise.resolve(''))}
      onUploadCv={vi.fn(() => Promise.resolve(''))}
      {...props}
    />,
  );
}

describe('AdminProfileView', () => {
  it('заполняет форму значениями активной локали (ru)', () => {
    renderView();

    expect(screen.getByLabelText('Имя', { exact: false })).toHaveValue('Богдан Сутужко');
    expect(screen.getByLabelText('Роль', { exact: false })).toHaveValue('Fullstack-разработчик');
  });

  it('в локали en подставляет английские значения', () => {
    renderView({ locale: 'en' });

    expect(screen.getByLabelText('Роль', { exact: false })).toHaveValue('Full Stack Developer');
  });

  it('сохранение вызывает onSave: локализованные поля уходят в активной локали', async () => {
    const onSave = vi.fn();
    renderView({ onSave });

    const name = screen.getByLabelText('Имя', { exact: false });
    await userEvent.clear(name);
    await userEvent.type(name, 'Новое Имя');
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
    expect(onSave.mock.calls[0]?.[0]).toMatchObject({
      name: { ru: 'Новое Имя' },
      roleTitle: { ru: 'Fullstack-разработчик' },
    });
    // Второй аргумент — URL контактов Telegram/GitHub (отдельный ресурс).
    expect(onSave.mock.calls[0]?.[1]).toMatchObject({
      telegram: 'https://t.me/sutuzhko',
      github: 'https://github.com/sutuzhko',
    });
  });

  it('валидация: пустое имя блокирует сохранение', async () => {
    const onSave = vi.fn();
    renderView({ onSave });

    await userEvent.clear(screen.getByLabelText('Имя', { exact: false }));
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    expect(await screen.findByText('Укажите имя')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('редактор показателей: добавляет и удаляет строку', async () => {
    renderView();

    const before = screen.getAllByLabelText('Значение', { exact: false }).length;
    await userEvent.click(screen.getByRole('button', { name: '+ показатель' }));
    expect(screen.getAllByLabelText('Значение', { exact: false })).toHaveLength(before + 1);

    await userEvent.click(screen.getAllByRole('button', { name: 'Удалить показатель' })[0]);
    expect(screen.getAllByLabelText('Значение', { exact: false })).toHaveLength(before);
  });

  it('правка показателя уходит в onSave, сохраняя перевод во второй локали', async () => {
    const onSave = vi.fn();
    renderView({ onSave });

    const caption = screen.getByDisplayValue('года в коммерческой разработке');
    await userEvent.clear(caption);
    await userEvent.type(caption, 'года в проде');
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
    const update = onSave.mock.calls[0]?.[0] as UpdateProfile | undefined;
    expect(update?.highlights?.[0]).toEqual({
      value: '3+',
      label: { ru: 'года в проде', en: 'years in commercial development' },
    });
  });

  it('выбор фото открывает окно кадрирования', async () => {
    const { container } = renderView();

    const file = new File(['x'], 'avatar.png', { type: 'image/png' });
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error('file input not found');
    await userEvent.upload(input, file);

    expect(await screen.findByRole('dialog', { name: 'Кадрирование аватара' })).toBeInTheDocument();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderView();
    expect(await axe(container)).toHaveNoViolations();
  });
});

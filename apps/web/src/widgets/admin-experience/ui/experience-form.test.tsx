import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockExperienceAdmin } from '@/entities/experience/mocks';
import { mockTechnologiesAdmin } from '@/entities/technology/mocks';

import { ExperienceForm } from './experience-form';

function renderForm(overrides: Partial<Parameters<typeof ExperienceForm>[0]> = {}) {
  return renderWithProviders(
    <ExperienceForm
      record={null}
      technologies={mockTechnologiesAdmin}
      locale="ru"
      isBusy={false}
      onCreate={vi.fn()}
      onUpdate={vi.fn()}
      onCancel={vi.fn()}
      {...overrides}
    />,
  );
}

describe('ExperienceForm', () => {
  it('создание отправляет тело с базовой локалью и технологиями', async () => {
    const onCreate = vi.fn();
    renderForm({ onCreate });

    await userEvent.type(screen.getByLabelText('Компания', { exact: false }), 'Acme');
    await userEvent.type(screen.getByLabelText('Должность', { exact: false }), 'Инженер');
    fireEvent.change(screen.getByLabelText('Начало', { exact: false }), {
      target: { value: '2024-05' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'React' }));
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate.mock.calls[0]?.[0]).toMatchObject({
      company: 'Acme',
      role: { ru: 'Инженер' },
      startDate: '2024-05-01T00:00:00.000Z',
      current: false,
      technologyIds: ['0'],
    });
  });

  it('редактирование существующей записи шлёт патч активной локали', async () => {
    const onUpdate = vi.fn();
    renderForm({ record: mockExperienceAdmin[0] ?? null, onUpdate });

    const roleInput = screen.getByDisplayValue('Frontend-разработчик');
    await userEvent.clear(roleInput);
    await userEvent.type(roleInput, 'Ведущий разработчик');
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0]?.[0]).toBe('go-mobile');
    expect(onUpdate.mock.calls[0]?.[1]).toMatchObject({
      role: { ru: 'Ведущий разработчик' },
      company: 'Go Mobile',
    });
  });

  it('«Отмена» вызывает onCancel', async () => {
    const onCancel = vi.fn();
    renderForm({ onCancel });
    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('не нарушает доступность', async () => {
    const { container } = renderForm();
    expect(await axe(container)).toHaveNoViolations();
  });
});

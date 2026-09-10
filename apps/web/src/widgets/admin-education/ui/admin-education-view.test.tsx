import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/app/test/render';
import { mockEducationAdmin } from '@/entities/education/mocks';

import { buildRows, type EducationRow } from '../model/education-form';

import { AdminEducationView } from './admin-education-view';

function renderView(overrides: Partial<Parameters<typeof AdminEducationView>[0]> = {}) {
  return renderWithProviders(
    <AdminEducationView
      rows={buildRows(mockEducationAdmin, 'ru')}
      isBusy={false}
      onSave={vi.fn()}
      {...overrides}
    />,
  );
}

describe('AdminEducationView', () => {
  it('раскладывает записи по секциям типа', () => {
    renderView();
    expect(screen.getByText('Высшее образование')).toBeInTheDocument();
    expect(screen.getByText('Курсы и сертификаты')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Бакалавр лингвистики')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Frontend-разработка')).toBeInTheDocument();
  });

  it('период — два поля-месяца с датами записи', () => {
    renderView();
    expect(screen.getAllByLabelText('Дата начала')[0]).toHaveValue('2014-09');
    expect(screen.getAllByLabelText('Дата окончания')[0]).toHaveValue('2018-06');
  });

  it('«+ запись» добавляет карточку высшего образования', async () => {
    renderView();
    const before = screen.getAllByPlaceholderText('Степень / специальность').length;
    await userEvent.click(screen.getByRole('button', { name: '+ запись' }));
    expect(screen.getAllByPlaceholderText('Степень / специальность')).toHaveLength(before + 1);
  });

  it('новую запись нельзя сохранить без даты начала', async () => {
    renderView();
    expect(screen.queryByRole('button', { name: /Сохранить/ })).not.toBeInTheDocument();
    // Пустая новая карточка не считается изменением — бар остаётся скрытым.
    await userEvent.click(screen.getByRole('button', { name: '+ запись' }));
    expect(screen.queryByRole('button', { name: /Сохранить/ })).not.toBeInTheDocument();

    const degrees = screen.getAllByPlaceholderText('Степень / специальность');
    await userEvent.type(degrees[degrees.length - 1], 'Магистратура');
    expect(screen.getByText('Укажите дату начала')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Сохранить/ })).toBeDisabled();

    // Секция «Высшее» идёт первой, поэтому поле даты новой карточки — по индексу её степени.
    const starts = screen.getAllByLabelText('Дата начала');
    fireEvent.change(starts[degrees.length - 1], { target: { value: '2024-09' } });
    expect(screen.getByRole('button', { name: /Сохранить/ })).toBeEnabled();
  });

  it('окончание раньше начала блокирует сохранение', () => {
    renderView();
    fireEvent.change(screen.getAllByLabelText('Дата окончания')[0], {
      target: { value: '2010-01' },
    });
    expect(screen.getByText('Окончание раньше начала')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Сохранить/ })).toBeDisabled();
  });

  it('правка поля и «Сохранить» отдаёт строки с новым значением', async () => {
    const onSave = vi.fn();
    renderView({ onSave });

    const degree = screen.getByDisplayValue('Бакалавр лингвистики');
    await userEvent.clear(degree);
    await userEvent.type(degree, 'Магистр лингвистики');
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const rows = onSave.mock.calls[0]?.[0] as readonly EducationRow[];
    const deletedIds = onSave.mock.calls[0]?.[1] as readonly string[];
    expect(rows.find((row) => row.id === 'mslu')?.degree).toBe('Магистр лингвистики');
    expect(deletedIds).toEqual([]);
  });

  it('удаление записи попадает в deletedIds при сохранении', async () => {
    const onSave = vi.fn();
    renderView({ onSave });

    await userEvent.click(screen.getAllByRole('button', { name: 'Удалить' })[0]);
    expect(screen.queryByDisplayValue('Бакалавр лингвистики')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Сохранить/ }));
    const deletedIds = onSave.mock.calls[0]?.[1] as readonly string[];
    expect(deletedIds).toContain('mslu');
  });

  it('не нарушает доступность', async () => {
    const { container } = renderView();
    expect(await axe(container)).toHaveNoViolations();
  });
});

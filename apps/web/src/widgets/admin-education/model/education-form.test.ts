import { describe, expect, it } from 'vitest';

import { mockEducationAdmin } from '@/entities/education/mocks';

import {
  buildRows,
  emptyRow,
  hasRowErrors,
  rowToCreate,
  rowToUpdate,
  validateRow,
  type EducationRow,
} from './education-form';

const filled = (overrides: Partial<EducationRow> = {}): EducationRow => ({
  ...emptyRow('MAIN'),
  degree: 'Магистратура',
  ...overrides,
});

describe('education-form', () => {
  it('buildRows переводит даты в значения полей-месяцев', () => {
    const rows = buildRows(mockEducationAdmin, 'ru');
    expect(rows[0]).toMatchObject({ startMonth: '2014-09', endMonth: '2018-06' });
    expect(rows[1]).toMatchObject({ startMonth: '2020-03', endMonth: '' });
  });

  it('пустая новая строка не проверяется — она не уйдёт на сохранение', () => {
    expect(validateRow(emptyRow('MAIN'))).toEqual({});
  });

  it('дата начала обязательна для заполненной строки', () => {
    expect(validateRow(filled()).startMonth).toBe('admin.education.errors.startRequired');
    expect(hasRowErrors(filled())).toBe(true);
  });

  it('окончание раньше начала — ошибка', () => {
    expect(validateRow(filled({ startMonth: '2024-09', endMonth: '2024-01' })).endMonth).toBe(
      'admin.education.errors.endBeforeStart',
    );
  });

  it('окончание необязательно', () => {
    expect(hasRowErrors(filled({ startMonth: '2024-09' }))).toBe(false);
  });

  it('rowToCreate шлёт ISO первого числа месяца и опускает пустое окончание', () => {
    expect(rowToCreate(filled({ startMonth: '2024-09' }), 'ru')).toMatchObject({
      startDate: '2024-09-01T00:00:00.000Z',
      endDate: undefined,
    });
  });

  it('rowToUpdate снимает окончание через null', () => {
    const update = rowToUpdate(filled({ id: 'x', startMonth: '2024-09' }), 'ru');
    expect(update.startDate).toBe('2024-09-01T00:00:00.000Z');
    expect(update.endDate).toBeNull();
  });
});

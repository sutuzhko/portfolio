import { describe, expect, it } from 'vitest';

import { formatMonthRange } from './format-month-range';

describe('formatMonthRange', () => {
  it('диапазон начала и окончания', () => {
    expect(formatMonthRange('2019-01-01T00:00:00.000Z', '2021-06-01T00:00:00.000Z', 'en')).toBe(
      'Jan 2019 — Jun 2021',
    );
  });

  it('открытый период с меткой — «… — наст. время»', () => {
    const result = formatMonthRange('2021-01-01T00:00:00.000Z', null, 'ru', 'наст. время');
    expect(result).toContain('2021');
    expect(result).toMatch(/— наст\. время$/);
  });

  it('без окончания и без метки — только дата начала', () => {
    expect(formatMonthRange('2020-03-01T00:00:00.000Z', null, 'en')).toBe('Mar 2020');
  });

  it('первое число месяца в UTC не съезжает на предыдущий месяц', () => {
    expect(formatMonthRange('2014-09-01T00:00:00.000Z', null, 'en')).toBe('Sep 2014');
  });
});

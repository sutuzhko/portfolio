import { describe, expect, it } from 'vitest';

import { formatPeriod } from './model/format-period';

describe('formatPeriod', () => {
  it('текущее место работы — метка настоящего вместо даты окончания', () => {
    const result = formatPeriod('2021-01-15T00:00:00.000Z', null, true, 'ru', 'наст. время');
    expect(result).toContain('наст. время');
    expect(result).toContain('2021');
  });

  it('завершённое место — диапазон начала и конца', () => {
    const result = formatPeriod(
      '2019-01-15T00:00:00.000Z',
      '2021-06-15T00:00:00.000Z',
      false,
      'en',
      'present',
    );
    expect(result).toContain('2019');
    expect(result).toContain('2021');
    expect(result).not.toContain('present');
  });
});

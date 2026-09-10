import { describe, expect, it } from 'vitest';

import { isoToMonthInput, monthInputToIso } from './month-input';

describe('month-input', () => {
  it('ISO → значение поля-месяца', () => {
    expect(isoToMonthInput('2022-09-01T00:00:00.000Z')).toBe('2022-09');
  });

  it('нет даты → пустое поле', () => {
    expect(isoToMonthInput(null)).toBe('');
  });

  it('значение поля → ISO первого числа месяца в UTC', () => {
    expect(monthInputToIso('2024-07')).toBe('2024-07-01T00:00:00.000Z');
  });

  it('туда и обратно без потерь', () => {
    expect(isoToMonthInput(monthInputToIso('2018-06'))).toBe('2018-06');
  });
});

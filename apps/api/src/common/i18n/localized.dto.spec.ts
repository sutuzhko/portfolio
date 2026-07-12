import { mergeList, mergeText } from './localized.dto';

describe('mergeText', () => {
  it('патч только ru не затирает сохранённый en', () => {
    const result = mergeText({ ru: 'старое', en: 'old' }, { ru: 'новое' });
    expect(result).toEqual({ ru: 'новое', en: 'old' });
  });

  it('патч только en не затирает сохранённый ru', () => {
    const result = mergeText({ ru: 'русский', en: 'old' }, { en: 'new' });
    expect(result).toEqual({ ru: 'русский', en: 'new' });
  });

  it('патч обеих локалей перезаписывает обе', () => {
    const result = mergeText({ ru: 'a', en: 'b' }, { ru: 'c', en: 'd' });
    expect(result).toEqual({ ru: 'c', en: 'd' });
  });

  it('патч en, когда сохранён только ru, добавляет вторую локаль', () => {
    const result = mergeText({ ru: 'только русский' }, { en: 'now english' });
    expect(result).toEqual({ ru: 'только русский', en: 'now english' });
  });

  it('патч ru, когда en не было, не создаёт пустой en', () => {
    const result = mergeText({ ru: 'старое' }, { ru: 'новое' });
    expect(result).toEqual({ ru: 'новое' });
  });

  it('пустая строка en — осознанная очистка локали, а не «не трогали»', () => {
    const result = mergeText({ ru: 'a', en: 'b' }, { en: '' });
    expect(result).toEqual({ ru: 'a', en: '' });
  });

  it('пустой патч сохраняет текущее значение', () => {
    const result = mergeText({ ru: 'a', en: 'b' }, {});
    expect(result).toEqual({ ru: 'a', en: 'b' });
  });

  it('легаси-значение строкой читается как ru', () => {
    const result = mergeText('легаси', { en: 'english' });
    expect(result).toEqual({ ru: 'легаси', en: 'english' });
  });

  it('отсутствующее значение (null) и патч ru дают чистый ru', () => {
    const result = mergeText(null, { ru: 'первое' });
    expect(result).toEqual({ ru: 'первое' });
  });
});

describe('mergeList', () => {
  it('патч только ru не затирает сохранённый en-список', () => {
    const result = mergeList({ ru: ['а'], en: ['a'] }, { ru: ['б', 'в'] });
    expect(result).toEqual({ ru: ['б', 'в'], en: ['a'] });
  });

  it('патч только en не затирает сохранённый ru-список', () => {
    const result = mergeList({ ru: ['а'], en: ['a'] }, { en: ['b'] });
    expect(result).toEqual({ ru: ['а'], en: ['b'] });
  });

  it('патч ru, когда en-списка не было, не создаёт пустой en', () => {
    const result = mergeList({ ru: ['а'] }, { ru: ['б'] });
    expect(result).toEqual({ ru: ['б'] });
  });

  it('пустой массив en — осознанная очистка локали', () => {
    const result = mergeList({ ru: ['а'], en: ['a'] }, { en: [] });
    expect(result).toEqual({ ru: ['а'], en: [] });
  });

  it('пустой патч сохраняет текущее значение', () => {
    const result = mergeList({ ru: ['а'], en: ['a'] }, {});
    expect(result).toEqual({ ru: ['а'], en: ['a'] });
  });
});

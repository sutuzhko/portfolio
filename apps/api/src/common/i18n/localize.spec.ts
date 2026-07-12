import { localize, localizeList, localizeNullable } from './localize';

describe('localize', () => {
  it('возвращает значение нужной локали', () => {
    expect(localize({ ru: 'Привет', en: 'Hello' }, 'en')).toBe('Hello');
    expect(localize({ ru: 'Привет', en: 'Hello' }, 'ru')).toBe('Привет');
  });

  it('откатывается на ru, если перевода нет', () => {
    expect(localize({ ru: 'Только ру' }, 'en')).toBe('Только ру');
  });

  it('для пустых значений возвращает пустую строку', () => {
    expect(localize(null, 'ru')).toBe('');
    expect(localize(undefined, 'en')).toBe('');
  });

  it('строку возвращает как есть', () => {
    expect(localize('plain', 'en')).toBe('plain');
  });
});

describe('localizeNullable', () => {
  it('возвращает null для пустых значений', () => {
    expect(localizeNullable(null, 'ru')).toBeNull();
    expect(localizeNullable({ ru: '' }, 'ru')).toBeNull();
  });

  it('возвращает строку, когда значение есть', () => {
    expect(localizeNullable({ ru: 'Текст' }, 'ru')).toBe('Текст');
  });
});

describe('localizeList', () => {
  it('возвращает список нужной локали с откатом на ru', () => {
    expect(localizeList({ ru: ['а', 'б'], en: ['a', 'b'] }, 'en')).toEqual(['a', 'b']);
    expect(localizeList({ ru: ['а'] }, 'en')).toEqual(['а']);
  });

  it('для пустых значений возвращает []', () => {
    expect(localizeList(null, 'ru')).toEqual([]);
  });
});

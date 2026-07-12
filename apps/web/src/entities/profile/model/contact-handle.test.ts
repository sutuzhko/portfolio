import { describe, expect, it } from 'vitest';

import type { ProfileContact } from './types';
import { telegramHandle } from './contact-handle';

const telegram: ProfileContact = { icon: 'telegram', url: 'https://t.me/sutuzhko' };
const github: ProfileContact = { icon: 'github', url: 'https://github.com/x' };

describe('telegramHandle', () => {
  it('выводит @-ник из ссылки Telegram', () => {
    expect(telegramHandle([github, telegram])).toBe('@sutuzhko');
  });

  it('возвращает undefined без Telegram-контакта', () => {
    expect(telegramHandle([github])).toBeUndefined();
    expect(telegramHandle(undefined)).toBeUndefined();
  });

  it('возвращает undefined на нераспознаваемой ссылке', () => {
    expect(telegramHandle([{ icon: 'telegram', url: 'not a url' }])).toBeUndefined();
  });
});

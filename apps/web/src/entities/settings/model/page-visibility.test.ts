import { describe, expect, it } from 'vitest';

import { isPathEnabled, type PageVisibility } from './page-visibility';

const allVisible: PageVisibility = { projects: true, experience: true, contact: true };

describe('isPathEnabled', () => {
  it('следует флагу страницы проектов (список и деталь)', () => {
    const v: PageVisibility = { ...allVisible, projects: false };
    expect(isPathEnabled('/projects', v)).toBe(false);
    expect(isPathEnabled('/projects/some-slug', v)).toBe(false);
    expect(isPathEnabled('/projects', allVisible)).toBe(true);
  });

  it('следует флагам опыта и контактов', () => {
    expect(isPathEnabled('/experience', { ...allVisible, experience: false })).toBe(false);
    expect(isPathEnabled('/contact', { ...allVisible, contact: false })).toBe(false);
  });

  it('приватные и неизвестные пути всегда разрешены', () => {
    const off: PageVisibility = { projects: false, experience: false, contact: false };
    expect(isPathEnabled('/admin', off)).toBe(true);
    expect(isPathEnabled('/database', off)).toBe(true);
    expect(isPathEnabled('/', off)).toBe(true);
    expect(isPathEnabled('/login', off)).toBe(true);
  });
});

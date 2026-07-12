import { describe, expect, it } from 'vitest';

import { mockProfileAdmin } from '@/entities/profile/mocks';

import { formToUpdate, profileToForm } from './profile-form';

describe('profile-form mappers', () => {
  it('profileToForm(ru): локализованные поля берут ru, heroStack → строка', () => {
    const form = profileToForm(mockProfileAdmin, 'ru');

    expect(form.name).toBe('Богдан Сутужко');
    expect(form.roleTitle).toBe('Fullstack-разработчик');
    expect(form.heroStack).toBe('React, Vue 3, Next.js, Node · NestJS, TypeScript');
    expect(form.availability).toBe('ACTIVE');
  });

  it('profileToForm(en): локализованные поля берут en', () => {
    const form = profileToForm(mockProfileAdmin, 'en');

    expect(form.name).toBe('Bogdan Sutuzhko');
    expect(form.roleTitle).toBe('Full Stack Developer');
  });

  it('formToUpdate(ru): локализованные поля уходят в ru, heroStack → массив, значения тримятся', () => {
    const form = profileToForm(mockProfileAdmin, 'ru');
    const update = formToUpdate(
      { ...form, heroStack: 'React,  Vue 3 , ', location: 'Москва' },
      'ru',
    );

    expect(update.heroStack).toEqual(['React', 'Vue 3']);
    expect(update.location).toEqual({ ru: 'Москва' });
    expect(update.roleTitle).toEqual({ ru: 'Fullstack-разработчик' });
  });

  it('formToUpdate(en): патчит только английскую локаль (ru сохранит мёрж на бэке)', () => {
    const form = profileToForm(mockProfileAdmin, 'en');
    const update = formToUpdate({ ...form, roleTitle: 'Senior Engineer' }, 'en');

    expect(update.roleTitle).toEqual({ en: 'Senior Engineer' });
    expect(update.roleTitle).not.toHaveProperty('ru');
  });

  it('profileToForm: показатели раскладываются на активную и скрытую вторую локаль', () => {
    const form = profileToForm(mockProfileAdmin, 'ru');

    expect(form.highlights[0]).toEqual({
      value: '3+',
      label: 'года в коммерческой разработке',
      labelOther: 'years in commercial development',
    });
  });

  it('formToUpdate(ru): правка подписи показателя сохраняет en во второй локали', () => {
    const form = profileToForm(mockProfileAdmin, 'ru');
    const highlights = form.highlights.map((h, i) =>
      i === 0 ? { ...h, label: 'года в проде' } : h,
    );
    const update = formToUpdate({ ...form, highlights }, 'ru');

    expect(update.highlights?.[0]).toEqual({
      value: '3+',
      label: { ru: 'года в проде', en: 'years in commercial development' },
    });
  });

  it('formToUpdate(en): новый показатель без ru дублирует активное значение в ru', () => {
    const form = profileToForm(mockProfileAdmin, 'en');
    const update = formToUpdate(
      { ...form, highlights: [{ value: '5', label: 'projects shipped', labelOther: '' }] },
      'en',
    );

    expect(update.highlights).toEqual([
      { value: '5', label: { ru: 'projects shipped', en: 'projects shipped' } },
    ]);
  });

  it('formToUpdate: показатели без значения отбрасываются', () => {
    const form = profileToForm(mockProfileAdmin, 'ru');
    const update = formToUpdate(
      { ...form, highlights: [{ value: '  ', label: 'breluk', labelOther: '' }] },
      'ru',
    );

    expect(update.highlights).toEqual([]);
  });

  it('formToUpdate: интро-тексты уходят в активной локали', () => {
    const form = profileToForm(mockProfileAdmin, 'ru');
    const update = formToUpdate({ ...form, projectsIntro: '  Новое интро  ' }, 'ru');

    expect(update.projectsIntro).toEqual({ ru: 'Новое интро' });
  });
});

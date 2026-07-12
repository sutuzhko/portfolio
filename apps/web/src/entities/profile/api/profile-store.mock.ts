import type { AppLanguage } from '@/shared/config';

import type { LocalizedText, Profile, ProfileAdmin } from '../model/types';

/**
 * Единый источник правды для моков профиля: двуязычный профиль, как он лежит в БД.
 *
 * Публичный `GET /profile` и админский `GET /profile/admin` читают ОДНО состояние,
 * поэтому правка в CRM видна на публичных экранах — ровно как с реальным API.
 * Раньше это были две независимые фикстуры, и `dev:mock` врал: сохранение в кабинете
 * не меняло сайт, а в русской локали показывалось латинское имя (бэкенд локализует `name`).
 */
const initialAdminProfile: ProfileAdmin = {
  name: { ru: 'Богдан Сутужко', en: 'Bogdan Sutuzhko' },
  email: 'julfy.web@gmail.com',
  avatarPhotoUrl: null,
  avatarColor: '#238636',
  cvUrl: {
    ru: '/uploads/cv/Bogdan_Sutuzhko_CV.pdf',
    en: '/uploads/cv/Bogdan_Sutuzhko_CV_EN.pdf',
  },
  heroStack: ['React', 'Vue 3', 'Next.js', 'Node · NestJS', 'TypeScript'],
  availability: 'ACTIVE',
  isBioHidden: false,
  bioUpdatedAt: '2026-07-01T10:00:00.000Z',
  roleTitle: { ru: 'Fullstack-разработчик', en: 'Full Stack Developer' },
  location: { ru: 'Москва, Россия', en: 'Moscow, Russia' },
  headline: {
    ru: 'Строю аккуратный фронтенд и корпоративные UI-kit с нуля. Уверенно работаю и в React-, и в Vue-экосистемах. Ищу команду, где смогу раскрыть весь потенциал.',
    en: 'I build clean frontends and corporate UI-kits from scratch. Confident in both React and Vue ecosystems. Looking for a team where I can reach my full potential.',
  },
  bioMarkdown: {
    ru: [
      'Меня зовут Богдан Сутужко, и я Fullstack-разработчик. Это моя страсть, которая стала профессией. Люблю создавать красивые и полезные продукты, которые помогают бизнесу развиваться, а людям — решать задачи быстро и эффективно.',
      'Сейчас фронтенд-разработчик в [Go Mobile](https://gomobile.ru) — строю внутренние продукты и корпоративный UI-kit. До этого вёл ключевые фичи [Procharity](https://procharity.ru) — платформы интеллектуального волонтёрства.',
      'В свободное время веду проект **Deep Focus** вместе с [@gvozdenkov](https://github.com/gvozdenkov) — Pomodoro-трекер, который помогает оставаться продуктивным.',
    ].join('\n\n'),
    en: [
      "My name is Bogdan Sutuzhko and I'm a Fullstack developer. It's a passion that became my profession. I love building beautiful, useful products that help businesses grow and let people get things done fast and efficiently.",
      'Currently a frontend developer at [Go Mobile](https://gomobile.ru) — building internal products and a corporate UI kit. Before that I led key features of [Procharity](https://procharity.ru), an intellectual-volunteering platform.',
      'In my free time I run **Deep Focus** with [@gvozdenkov](https://github.com/gvozdenkov) — a Pomodoro tracker that helps you stay productive.',
    ].join('\n\n'),
  },
  projectsIntro: {
    ru: 'Коммерческие продукты и pet-проекты, над которыми я работал. Фильтруйте по стеку и участникам, чтобы найти нужное.',
    en: "Commercial products and pet projects I've worked on. Filter by stack and contributors to find what you need.",
  },
  experienceIntro: {
    ru: 'Уверенно работаю и с Vue, и с React-экосистемами. Системно подхожу к переиспользованию — на нескольких проектах строил UI-kit с нуля. Лингвистический бэкграунд и English C1 — читаю документацию и issues без переводчика.',
    en: 'Comfortable in both the Vue and React ecosystems. I take a systematic approach to reuse — I have built UI kits from scratch on several projects. A linguistics background and English C1 — I read docs and issues without a translator.',
  },
  contactIntro: {
    ru: 'Открыт к интересным задачам и предложениям. Пишите в любой из каналов — отвечаю быстро.',
    en: 'Open to interesting work and offers. Reach out via any channel — I reply quickly.',
  },
  highlights: [
    {
      value: '3+',
      label: { ru: 'года в коммерческой разработке', en: 'years in commercial development' },
    },
    { value: '3', label: { ru: 'UI-kit построил с нуля', en: 'UI-kits built from scratch' } },
    {
      value: 'C1',
      label: {
        ru: 'English — доки и issues без перевода',
        en: 'English — docs & issues, no translation',
      },
    },
    {
      value: '3 kyu',
      label: { ru: 'Codewars · 62 ката решено', en: 'Codewars · 62 katas solved' },
    },
  ],
  contacts: [
    { id: 'c1', icon: 'telegram', url: 'https://t.me/sutuzhko', hidden: false, order: 0 },
    { id: 'c2', icon: 'email', url: 'mailto:julfy.web@gmail.com', hidden: false, order: 1 },
    { id: 'c3', icon: 'github', url: 'https://github.com/sutuzhko', hidden: false, order: 2 },
    {
      id: 'c4',
      icon: 'codewars',
      url: 'https://www.codewars.com/users/sutuzhko',
      hidden: false,
      order: 3,
    },
  ],
};

// Состояние мока: PATCH мутирует его между запросами одного прогона.
let adminProfile: ProfileAdmin = initialAdminProfile;

export function getMockProfileState(): ProfileAdmin {
  return adminProfile;
}

export function setMockProfileState(next: ProfileAdmin): void {
  adminProfile = next;
}

/** Сбрасывает профиль мока — для изоляции тестов. */
export function resetMockProfileAdmin(): void {
  adminProfile = initialAdminProfile;
}

/** Фикстура админ-профиля (обе локали) — для тестов/историй. */
export const mockProfileAdmin = initialAdminProfile;

// Повторяют `localize`/`localizeNullable` бэкенда: для `en` откатываемся на `ru`,
// пустая строка считается отсутствием значения.
function localize(text: LocalizedText | null, language: AppLanguage): string {
  if (text === null) return '';
  return (language === 'ru' ? text.ru : text.en) ?? text.ru ?? '';
}

function localizeNullable(text: LocalizedText | null, language: AppLanguage): string | null {
  if (text === null) return null;
  const resolved = localize(text, language);
  return resolved.length > 0 ? resolved : null;
}

/**
 * Разрешает двуязычный профиль в публичный `ProfileDto` — как `ProfileService.get`:
 * скрытое био отдаётся как `null`, скрытые контакты не отдаются вовсе, порядок — по `order`.
 */
export function localizeProfile(admin: ProfileAdmin, language: AppLanguage): Profile {
  return {
    name: localize(admin.name, language),
    roleTitle: localize(admin.roleTitle, language),
    headline: localize(admin.headline, language),
    location: localize(admin.location, language),
    email: admin.email,
    avatarPhotoUrl: admin.avatarPhotoUrl,
    avatarColor: admin.avatarColor,
    cvUrl: localizeNullable(admin.cvUrl, language),
    heroStack: admin.heroStack,
    highlights: admin.highlights.map((highlight) => ({
      value: highlight.value,
      label: localize(highlight.label, language),
    })),
    availability: admin.availability,
    bioMarkdown: admin.isBioHidden ? null : localizeNullable(admin.bioMarkdown, language),
    projectsIntro: localizeNullable(admin.projectsIntro, language),
    experienceIntro: localizeNullable(admin.experienceIntro, language),
    contactIntro: localizeNullable(admin.contactIntro, language),
    contacts: admin.contacts
      .filter((contact) => !contact.hidden)
      .toSorted((a, b) => a.order - b.order)
      .map((contact) => ({ icon: contact.icon, url: contact.url })),
  };
}

/** Фикстура публичного профиля (русская локаль) для тестов и историй. */
export const mockProfile: Profile = localizeProfile(initialAdminProfile, 'ru');

/** Та же фикстура в английской локали — проверяет локализацию контента бэкендом. */
export const mockProfileEn: Profile = localizeProfile(initialAdminProfile, 'en');

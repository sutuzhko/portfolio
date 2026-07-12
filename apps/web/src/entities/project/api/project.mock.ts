import { http, HttpResponse } from 'msw';

import { env, normalizeLanguage, type AppLanguage } from '@/shared/config';

import type {
  CreateProject,
  ProjectAdmin,
  ProjectDetail,
  ProjectLink,
  ProjectListItem,
  ProjectMedia,
  ProjectMediaAdmin,
  UpdateProject,
} from '../model/types';

const contributors = {
  bogdan: {
    name: 'Богдан Сутужко',
    image: null,
    color: '#238636',
    link: 'https://github.com/sutuzhko',
  },
  alex: { name: 'Алексей Мартынов', image: null, color: '#8957e5', link: null },
  maria: { name: 'Мария Волкова', image: null, color: '#1f6feb', link: null },
  ivan: { name: 'Иван Петров', image: null, color: '#a371f7', link: null },
  gvozdenkov: {
    name: 'Гвозденков',
    image: null,
    color: '#db6d28',
    link: 'https://github.com/gvozdenkov',
  },
};

// Локализуется только описание — названия проектов и категории общие для локалей.
const descriptions: Record<
  AppLanguage,
  { procharity: string; deepFocus: string; game2048: string }
> = {
  ru: {
    procharity: 'Платформа интеллектуального волонтёрства',
    deepFocus: 'Pomodoro-трекер продуктивности',
    game2048:
      'Классическая головоломка 2048 на TypeScript и Canvas. Запусти прямо здесь — стрелками или кнопками.',
  },
  en: {
    procharity: 'An intellectual-volunteering platform',
    deepFocus: 'A productivity Pomodoro tracker',
    game2048:
      'The classic 2048 puzzle in TypeScript and Canvas. Play it right here — arrow keys or buttons.',
  },
};

function buildProjects(language: AppLanguage): ProjectListItem[] {
  const text = descriptions[language];
  return [
    {
      slug: 'procharity',
      title: 'Procharity',
      description: text.procharity,
      subtitle: language === 'en' ? 'Platform for nonprofits' : 'Платформа для НКО',
      category: 'commercial',
      period: '2021',
      tileColor: '#1d6f74',
      pinned: true,
      runnable: false,
      runCommand: null,
      embedUrl: null,
      primaryLanguage: 'TypeScript',
      technologies: ['TypeScript', 'React', 'SCSS', 'Redux', 'Webpack'],
      contributors: [contributors.bogdan, contributors.alex, contributors.maria, contributors.ivan],
    },
    {
      slug: 'deep-focus',
      title: 'Deep Focus',
      description: text.deepFocus,
      subtitle: language === 'en' ? 'A Pomodoro PWA' : 'Pomodoro-трекер (PWA)',
      category: 'side-project',
      period: '2023',
      tileColor: '#6b4ca8',
      pinned: true,
      runnable: false,
      runCommand: null,
      embedUrl: null,
      primaryLanguage: 'TypeScript',
      technologies: ['React', 'TypeScript', 'Node'],
      contributors: [contributors.bogdan, contributors.gvozdenkov],
    },
    {
      slug: '2048',
      title: language === 'en' ? 'Game: 2048' : 'Игра: 2048',
      description: text.game2048,
      subtitle: language === 'en' ? 'A Canvas puzzle' : 'Головоломка на Canvas',
      category: 'side-project',
      period: '2025',
      tileColor: '#6b4ca8',
      pinned: false,
      runnable: true,
      runCommand: 'run 2048',
      embedUrl: 'https://sutuzhko.github.io/2048/',
      primaryLanguage: 'TypeScript',
      technologies: ['TypeScript', 'canvas', 'css3', 'webpack5'],
      contributors: [contributors.bogdan],
    },
  ];
}

interface DetailText {
  readonly body: string;
  readonly bullets: readonly string[];
  readonly role: string;
  readonly links: readonly ProjectLink[];
}

const detailText: Record<AppLanguage, Record<string, DetailText>> = {
  ru: {
    procharity: {
      body: 'Procharity соединяет НКО и профессионалов, готовых помочь интеллектуальным трудом. Я вёл ключевые фичи фронтенда: личные кабинеты, отклики на задачи и внутреннюю дизайн-систему.\n\nОсобое внимание — доступности и производительности: список задач с фильтрами держал десятки тысяч записей без просадок.',
      bullets: [
        'Личные кабинеты волонтёра и НКО',
        'Система задач и откликов с фильтрами',
        'Дизайн-система на SCSS и переиспользуемые компоненты',
      ],
      role: 'Ведущий фронтенд-разработчик',
      links: [{ label: 'Сайт', href: 'https://procharity.ru' }],
    },
    'deep-focus': {
      body: 'Deep Focus — Pomodoro-трекер, который помогает удерживать концентрацию. Пет-проект вместе с @gvozdenkov.\n\nСобран как PWA с офлайн-режимом и статистикой фокуса по дням.',
      bullets: [
        'Таймер Pomodoro с гибкими настройками',
        'Статистика фокуса и серий',
        'PWA с офлайн-режимом',
      ],
      role: 'Автор проекта',
      links: [{ label: 'GitHub', href: 'https://github.com/gvozdenkov' }],
    },
    '2048': {
      body: '## Правила игры\n\n2048 играется на сетке 4×4 со степенями двойки. Каждый ход стрелками сдвигает все плитки; две одинаковые при столкновении сливаются. После хода появляется новая плитка: 2 (90%) или 4 (10%).\n\n## Конец игры\n\nПобеда — когда собрана плитка 2048; игру можно продолжить. Игра заканчивается, когда ходов не осталось.',
      bullets: [
        'Полная игровая логика: слияние тайлов, подсчёт очков, рекорд.',
        'Рендеринг сетки и тайлов на Canvas, адаптивное поле.',
        'Сохранение рекорда в localStorage.',
      ],
      role: 'Pet-проект',
      links: [
        { label: 'Открыть', href: 'https://sutuzhko.github.io/2048/' },
        { label: 'GitHub', href: 'https://github.com/sutuzhko/2048' },
      ],
    },
  },
  en: {
    procharity: {
      body: 'Procharity connects nonprofits with professionals willing to help through intellectual work. I led key frontend features: dashboards, task applications and the internal design system.\n\nA focus on accessibility and performance: the filtered task list handled tens of thousands of records without lag.',
      bullets: [
        'Volunteer and nonprofit dashboards',
        'Task and application system with filters',
        'SCSS design system and reusable components',
      ],
      role: 'Lead Frontend Developer',
      links: [{ label: 'Website', href: 'https://procharity.ru' }],
    },
    'deep-focus': {
      body: 'Deep Focus is a Pomodoro tracker that helps you stay concentrated. A pet project together with @gvozdenkov.\n\nBuilt as a PWA with an offline mode and daily focus statistics.',
      bullets: [
        'Pomodoro timer with flexible settings',
        'Focus and streak statistics',
        'PWA with an offline mode',
      ],
      role: 'Project author',
      links: [{ label: 'GitHub', href: 'https://github.com/gvozdenkov' }],
    },
    '2048': {
      body: '## Rules\n\n2048 is played on a 4×4 grid of powers of two. Each move (arrow keys) slides all tiles; two equal tiles that collide merge into one. After each move a new tile appears: 2 (90%) or 4 (10%).\n\n## Game over\n\nYou win when a 2048 tile appears — you may keep playing. The game ends when no moves are left.',
      bullets: [
        'Full game logic: tile merging, scoring, best result.',
        'Grid and tile rendering on Canvas, responsive board.',
        'Best score persisted in localStorage.',
      ],
      role: 'Pet project',
      links: [
        { label: 'Live', href: 'https://sutuzhko.github.io/2048/' },
        { label: 'GitHub', href: 'https://github.com/sutuzhko/2048' },
      ],
    },
  },
};

// Плейсхолдер-скриншот: SVG-градиент с подписью, отдаётся как data-URI. Без сети
// показывает, как выглядит галерея; реальные проекты отдают загруженные файлы `/uploads`.
function shot(label: string, from: string, to: string): ProjectMedia {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>` +
    `<rect width="640" height="400" fill="url(#g)"/>` +
    `<text x="32" y="368" fill="#ffffffcc" font-family="monospace" font-size="22">${label}</text></svg>`;
  return {
    url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    alt: label,
    width: 640,
    height: 400,
  };
}

// Две-три «карточки экрана» на проект, чтобы галерея детали была наглядной.
const galleryBySlug: Record<string, readonly ProjectMedia[]> = {
  procharity: [
    shot('dashboard.png', '#1d6f74', '#0f3d40'),
    shot('tasks.png', '#0f3d40', '#1d6f74'),
  ],
  'deep-focus': [shot('timer.png', '#6b4ca8', '#2f1d55'), shot('stats.png', '#2f1d55', '#6b4ca8')],
  '2048': [shot('board.png', '#7d4bd1', '#3a1d66'), shot('win.png', '#3a1d66', '#7d4bd1')],
};

function buildProjectDetails(language: AppLanguage): Record<string, ProjectDetail> {
  const details: Record<string, ProjectDetail> = {};
  for (const project of buildProjects(language)) {
    const text = detailText[language][project.slug];
    details[project.slug] = {
      ...project,
      bodyMarkdown: text.body,
      bullets: [...text.bullets],
      role: text.role,
      runHint: null,
      links: [...text.links],
      gallery: [...(galleryBySlug[project.slug] ?? [])],
    };
  }
  return details;
}

function firstParam(value: string | readonly string[]): string {
  return typeof value === 'string' ? value : value[0];
}

/** Фикстура списка проектов (русская локаль) для тестов. */
export const mockProjects: ProjectListItem[] = buildProjects('ru');

/** Фикстура детали проекта (Procharity, русская локаль) для тестов и историй. */
export const mockProjectDetail: ProjectDetail = buildProjectDetails('ru').procharity;

/** MSW-обработчики проектов. Локаль читается из `Accept-Language`. */
export const projectHandlers = [
  http.get(`${env.apiBaseUrl}/projects`, ({ request }) => {
    const language = normalizeLanguage(request.headers.get('Accept-Language') ?? undefined);
    return HttpResponse.json(buildProjects(language));
  }),
  http.get(`${env.apiBaseUrl}/projects/:slug`, ({ request, params }) => {
    const language = normalizeLanguage(request.headers.get('Accept-Language') ?? undefined);
    const detail = buildProjectDetails(language)[firstParam(params.slug)];
    return detail ? HttpResponse.json(detail) : new HttpResponse(null, { status: 404 });
  }),
];

// --- admin (обе локали + связи по id) ---

type LocalizedText = ProjectAdmin['title'];
type LocalizedList = NonNullable<ProjectAdmin['bullets']>;
type TextPatch = { ru?: string; en?: string };
type ListPatch = { ru?: string[]; en?: string[] };

const L = (ru: string, en: string): LocalizedText => ({ ru, en });

function buildAdminInitial(): ProjectAdmin[] {
  const now = '2026-07-01T10:00:00.000Z';
  return [
    {
      id: 'p-procharity',
      slug: 'procharity',
      title: L('Procharity', 'Procharity'),
      description: L(
        'Платформа интеллектуального волонтёрства',
        'An intellectual-volunteering platform',
      ),
      subtitle: L('Платформа для НКО', 'Platform for nonprofits'),
      bodyMarkdown: L(
        'Procharity соединяет НКО и профессионалов.',
        'Procharity connects nonprofits with professionals.',
      ),
      bullets: { ru: ['Личные кабинеты', 'Система задач'], en: ['Dashboards', 'Task system'] },
      role: L('Ведущий фронтенд-разработчик', 'Lead Frontend Developer'),
      category: 'commercial',
      period: '2021',
      tileColor: '#1d6f74',
      links: [{ label: L('Сайт', 'Website'), href: 'https://procharity.ru' }],
      runnable: false,
      runCommand: null,
      embedUrl: null,
      runHint: null,
      status: 'PUBLISHED',
      hidden: false,
      pinned: true,
      order: 0,
      primaryLanguageId: '3',
      technologyIds: ['0', '3', '4'],
      contributorIds: ['bogdan', 'alex', 'maria', 'ivan'],
      gallery: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'p-2048',
      slug: '2048',
      title: L('Игра: 2048', 'Game: 2048'),
      description: L('Классическая головоломка 2048', 'The classic 2048 puzzle'),
      subtitle: L('Головоломка на Canvas', 'A Canvas puzzle'),
      bodyMarkdown: L('## Правила\n\n2048 на сетке 4×4.', '## Rules\n\n2048 on a 4×4 grid.'),
      bullets: {
        ru: ['Игровая логика', 'Рендер на Canvas'],
        en: ['Game logic', 'Canvas rendering'],
      },
      role: L('Pet-проект', 'Pet project'),
      category: 'side-project',
      period: '2025',
      tileColor: '#6b4ca8',
      links: [{ label: L('Открыть', 'Live'), href: 'https://sutuzhko.github.io/2048/' }],
      runnable: true,
      runCommand: 'run 2048',
      embedUrl: 'https://sutuzhko.github.io/2048/',
      runHint: null,
      status: 'PUBLISHED',
      hidden: false,
      pinned: false,
      order: 1,
      primaryLanguageId: '3',
      technologyIds: ['3'],
      contributorIds: ['bogdan'],
      gallery: [],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

// Общее состояние админ-проектов: PATCH мутирует между запросами одного прогона.
let projectRecords: ProjectAdmin[] = buildAdminInitial();
let nextProjectId = projectRecords.length;

/** Сбрасывает админ-проекты мока — для изоляции тестов. */
export function resetMockProjects(): void {
  projectRecords = buildAdminInitial();
  nextProjectId = projectRecords.length;
}

function mergeText(existing: LocalizedText | null, patch: TextPatch): LocalizedText {
  const current = existing ?? { ru: '' };
  const ru = patch.ru ?? current.ru;
  const en = patch.en ?? current.en ?? undefined;
  return en === undefined ? { ru } : { ru, en };
}

function mergeList(existing: LocalizedList | null, patch: ListPatch): LocalizedList {
  const current = existing ?? { ru: [] };
  const ru = patch.ru ?? current.ru;
  const en = patch.en ?? current.en ?? undefined;
  return en === undefined ? { ru } : { ru, en };
}

/** Фикстура админ-проектов (обе локали) для тестов и историй. */
export const mockProjectsAdmin: ProjectAdmin[] = buildAdminInitial();

const sortedAdmin = (): ProjectAdmin[] => [...projectRecords].sort((a, b) => a.order - b.order);

/** Админ MSW-обработчики проектов: список обеих локалей + CRUD над общим состоянием. */
export const projectAdminHandlers = [
  http.get(`${env.apiBaseUrl}/projects/admin`, () => HttpResponse.json(sortedAdmin())),
  http.post<Record<string, never>, CreateProject>(
    `${env.apiBaseUrl}/projects`,
    async ({ request }) => {
      const body = await request.json();
      nextProjectId += 1;
      const now = new Date().toISOString();
      const created: ProjectAdmin = {
        id: `p-${nextProjectId}`,
        slug: body.slug,
        title: { ru: body.title.ru, en: body.title.en },
        description: { ru: body.description.ru, en: body.description.en },
        subtitle: body.subtitle ? { ru: body.subtitle.ru, en: body.subtitle.en } : null,
        bodyMarkdown: { ru: body.bodyMarkdown.ru, en: body.bodyMarkdown.en },
        bullets: body.bullets ? { ru: body.bullets.ru, en: body.bullets.en } : null,
        role: body.role ? { ru: body.role.ru, en: body.role.en } : null,
        category: body.category ?? null,
        period: body.period ?? null,
        tileColor: body.tileColor || null,
        links: body.links ?? [],
        runnable: body.runnable ?? false,
        runCommand: body.runCommand ?? null,
        embedUrl: body.embedUrl ?? null,
        runHint: body.runHint ? { ru: body.runHint.ru, en: body.runHint.en } : null,
        status: body.status ?? 'DRAFT',
        hidden: body.hidden ?? false,
        pinned: body.pinned ?? false,
        order: body.order ?? projectRecords.length,
        primaryLanguageId: body.primaryLanguageId ?? null,
        technologyIds: body.technologyIds ?? [],
        contributorIds: body.contributorIds ?? [],
        gallery: [],
        createdAt: now,
        updatedAt: now,
      };
      projectRecords.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.patch<{ id: string }, UpdateProject>(
    `${env.apiBaseUrl}/projects/:id`,
    async ({ request, params }) => {
      const body = await request.json();
      const record = projectRecords.find((item) => item.id === params.id);
      if (record === undefined) return new HttpResponse(null, { status: 404 });
      if (body.slug !== undefined) record.slug = body.slug;
      if (body.title !== undefined) record.title = mergeText(record.title, body.title);
      if (body.description !== undefined) {
        record.description = mergeText(record.description, body.description);
      }
      if (body.subtitle !== undefined) record.subtitle = mergeText(record.subtitle, body.subtitle);
      if (body.bodyMarkdown !== undefined) {
        record.bodyMarkdown = mergeText(record.bodyMarkdown, body.bodyMarkdown);
      }
      if (body.bullets !== undefined) record.bullets = mergeList(record.bullets, body.bullets);
      if (body.role !== undefined) record.role = mergeText(record.role, body.role);
      if (body.category !== undefined) record.category = body.category;
      if (body.period !== undefined) record.period = body.period;
      if (body.tileColor !== undefined) record.tileColor = body.tileColor || null;
      if (body.links !== undefined) record.links = body.links;
      if (body.runnable !== undefined) record.runnable = body.runnable;
      if (body.runCommand !== undefined) record.runCommand = body.runCommand;
      if (body.embedUrl !== undefined) record.embedUrl = body.embedUrl;
      if (body.runHint !== undefined) record.runHint = mergeText(record.runHint, body.runHint);
      if (body.status !== undefined) record.status = body.status;
      if (body.hidden !== undefined) record.hidden = body.hidden;
      if (body.pinned !== undefined) record.pinned = body.pinned;
      if (body.primaryLanguageId !== undefined) record.primaryLanguageId = body.primaryLanguageId;
      if (body.technologyIds !== undefined) record.technologyIds = body.technologyIds;
      if (body.contributorIds !== undefined) record.contributorIds = body.contributorIds;
      record.updatedAt = new Date().toISOString();
      return HttpResponse.json(record);
    },
  ),
  http.delete(`${env.apiBaseUrl}/projects/:id`, ({ params }) => {
    projectRecords = projectRecords.filter((item) => item.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
  // Загрузка скриншота в галерею: показываем реальный выбранный файл (object URL),
  // как настоящий бэкенд отдал бы `/uploads/...`. Кладём в галерею нужного проекта.
  http.post(`${env.apiBaseUrl}/media/gallery`, async ({ request }) => {
    const form = await request.formData();
    const file = form.get('file');
    const projectId = form.get('projectId');
    const record = projectRecords.find((item) => item.id === projectId);
    if (record === undefined || !(file instanceof Blob)) {
      return new HttpResponse(null, { status: 400 });
    }
    // Лимит 10 на проект — зеркалит бэкенд (`media.service`).
    if (record.gallery.length >= 10) {
      return new HttpResponse(null, { status: 400 });
    }
    const altRu = form.get('altRu');
    const asset: ProjectMediaAdmin = {
      id: `m-${Date.now()}-${record.gallery.length}`,
      url: URL.createObjectURL(file),
      type: 'GALLERY',
      alt: typeof altRu === 'string' && altRu.length > 0 ? { ru: altRu, en: null } : null,
      width: null,
      height: null,
      mime: file instanceof File ? file.type : null,
      size: file.size,
      formats: null,
      order: record.gallery.length,
      projectId: record.id,
    };
    record.gallery = [...record.gallery, asset];
    return HttpResponse.json(asset, { status: 201 });
  }),
  http.delete(`${env.apiBaseUrl}/media/:id`, ({ params }) => {
    for (const record of projectRecords) {
      record.gallery = record.gallery.filter((asset) => asset.id !== params.id);
    }
    return new HttpResponse(null, { status: 204 });
  }),
];

import { promises as fs } from 'node:fs';
import { basename, resolve } from 'node:path';
import { PrismaClient, type Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import sharp from 'sharp';

const prisma = new PrismaClient();

// Каталог статики — совпадает с runtime (StorageService: UPLOAD_DIR ?? 'uploads',
// путь резолвится от cwd, а сид и API стартуют из apps/api).
const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR ?? 'uploads');

// Стоимость bcrypt — компромисс между безопасностью и скоростью сидирования.
const BCRYPT_ROUNDS = 12;

// Хелпер LocalizedText — `{ ru, en }`.
const L = (ru: string, en?: string): Prisma.InputJsonValue => (en ? { ru, en } : { ru });

// Достаём русский текст из LocalizedText-Json без `as` (сужаем через typeof/in).
const readRu = (value: Prisma.JsonValue | null | undefined): string | undefined => {
  if (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof value.ru === 'string'
  ) {
    return value.ru;
  }
  return undefined;
};

const escapeXml = (text: string): string =>
  text.replace(/[<>&'"]/g, (ch) => {
    const map: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&apos;',
      '"': '&quot;',
    };
    return map[ch] ?? ch;
  });

// Брендированная заглушка скриншота: градиент цвета плитки проекта + диагональная
// штриховка (как в ProjectBackground на фронте) + название и подпись. Лучше пустой
// «битой» картинки: сид не тащит бинарники, а генерит их на месте (в т.ч. на проде).
const galleryPlaceholderSvg = (color: string, title: string, caption: string): string => {
  const width = 1200;
  const height = 675;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.40"/>
    </linearGradient>
    <pattern id="stripes" width="28" height="28" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="28" stroke="#ffffff" stroke-opacity="0.05" stroke-width="14"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="${color}"/>
  <rect width="${width}" height="${height}" fill="url(#stripes)"/>
  <rect width="${width}" height="${height}" fill="url(#sheen)"/>
  <text x="${width / 2}" y="${height / 2 - 6}" text-anchor="middle" font-family="sans-serif" font-size="66" font-weight="700" fill="#ffffff">${escapeXml(title)}</text>
  <text x="${width / 2}" y="${height / 2 + 46}" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#ffffff" fill-opacity="0.78">${escapeXml(caption)}</text>
</svg>`;
};

// Для каждого GalleryAsset пишем реальный PNG по его url. Иначе на детали проекта
// висят «битые» превью (сид создавал строки БД, но не файлы на диске).
async function generateGalleryPlaceholders(): Promise<void> {
  const assets = await prisma.mediaAsset.findMany({
    where: { type: 'GALLERY' },
    include: { project: true },
  });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  for (const asset of assets) {
    // url вида `/uploads/<файл>.png` → пишем в UPLOAD_DIR под тем же именем.
    // basename отсекает любые попытки выйти за каталог.
    const filename = basename(asset.url);
    const color = asset.project?.tileColor ?? '#1f6feb';
    const title = readRu(asset.project?.title) ?? 'Preview';
    const caption = readRu(asset.alt) ?? '';
    const svg = galleryPlaceholderSvg(color, title, caption);
    await sharp(Buffer.from(svg)).png().toFile(resolve(UPLOAD_DIR, filename));
  }
  console.log(`Сгенерированы заглушки галереи: ${assets.length}`);
}

async function reset(): Promise<void> {
  // Порядок важен: сначала чистим зависимые строки, потом родительские.
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.project.deleteMany();
  await prisma.contributor.deleteMany();
  await prisma.technology.deleteMany();
  await prisma.article.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.language.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.contactLink.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.settings.deleteMany();
}

async function main(): Promise<void> {
  await reset();

  // Владелец приватной зоны (роль ADMIN). Логин/пароль берём из окружения,
  // с безопасными для локалки значениями по умолчанию.
  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const password = process.env.ADMIN_PASSWORD ?? 'admin12345';
  await prisma.user.create({
    data: {
      username,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      role: 'ADMIN',
    },
  });

  // Настройки (синглтон)
  await prisma.settings.create({ data: { id: 1 } });

  // Профиль (синглтон) + контактные ссылки
  await prisma.profile.create({
    data: {
      id: 1,
      name: L('Богдан Сутужко', 'Bogdan Sutuzhko'),
      roleTitle: L('Fullstack-разработчик', 'Fullstack Developer'),
      headline: L(
        'Строю аккуратный фронтенд и корпоративные UI-kit с нуля. Уверенно работаю и в React-, и в Vue-экосистемах. Ищу команду, где смогу раскрыть весь потенциал.',
        'I build clean frontends and corporate UI-kits from scratch. Confident in both React and Vue ecosystems. Looking for a team where I can reach my full potential.',
      ),
      location: L('Москва, Россия', 'Moscow, Russia'),
      email: 'hello@sutuzhko.dev',
      avatarColor: '#238636',
      cvUrl: {
        ru: '/uploads/cv/Bogdan_Sutuzhko_CV.pdf',
        en: '/uploads/cv/Bogdan_Sutuzhko_CV_EN.pdf',
      },
      heroStack: ['React', 'Vue 3', 'Next.js', 'Node · NestJS', 'TypeScript'],
      highlights: [
        {
          value: '3+',
          label: L('года в коммерческой разработке', 'years in commercial development'),
        },
        { value: '3', label: L('UI-kit построил с нуля', 'UI-kits built from scratch') },
        {
          value: 'C1',
          label: L(
            'English — доки и issues без перевода',
            'English — docs & issues, no translation',
          ),
        },
        { value: '3 kyu', label: L('Codewars · 62 ката решено', 'Codewars · 62 katas solved') },
      ],
      availability: 'OPEN',
      bioMarkdown: L(
        [
          'Меня зовут Богдан Сутужко, и я Fullstack-разработчик. Это моя страсть, которая стала профессией. Люблю создавать красивые и полезные продукты, которые помогают бизнесу развиваться, а людям — решать задачи быстро и эффективно.',
          'Сейчас фронтенд-разработчик в [Go Mobile](https://gomobile.ru) — строю внутренние продукты и корпоративный UI-kit. До этого вёл ключевые фичи [Procharity](https://procharity.ru) — платформы интеллектуального волонтёрства.',
          'В свободное время веду проект **Deep Focus** вместе с [@gvozdenkov](https://github.com/gvozdenkov) — Pomodoro-трекер, который помогает оставаться продуктивным.',
        ].join('\n\n'),
        [
          "My name is Bogdan Sutuzhko and I'm a Fullstack developer. It's a passion that became my profession. I love building beautiful, useful products that help businesses grow and let people get things done fast and efficiently.",
          'Currently a frontend developer at [Go Mobile](https://gomobile.ru) — building internal products and a corporate UI kit. Before that I led key features of [Procharity](https://procharity.ru), an intellectual-volunteering platform.',
          'In my free time I run **Deep Focus** with [@gvozdenkov](https://github.com/gvozdenkov) — a Pomodoro tracker that helps you stay productive.',
        ].join('\n\n'),
      ),
      projectsIntro: L(
        'Коммерческие продукты и pet-проекты, над которыми я работал. Фильтруйте по стеку и участникам, чтобы найти нужное.',
        "Commercial products and pet projects I've worked on. Filter by stack and contributors to find what you need.",
      ),
      experienceIntro: L(
        'Уверенно работаю и с Vue, и с React-экосистемами. Системно подхожу к переиспользованию — на нескольких проектах строил UI-kit с нуля. Лингвистический бэкграунд и English C1 — читаю документацию и issues без переводчика.',
        'Comfortable in both the Vue and React ecosystems. I take a systematic approach to reuse — I have built UI kits from scratch on several projects. A linguistics background and English C1 — I read docs and issues without a translator.',
      ),
      contactIntro: L(
        'Открыт к интересным задачам и предложениям. Пишите в любой из каналов — отвечаю быстро.',
        'Open to interesting work and offers. Reach out via any channel — I reply quickly.',
      ),
      contactLinks: {
        create: [
          { icon: 'telegram', url: 'https://t.me/julfy_bs', order: 0 },
          { icon: 'codewars', url: 'https://www.codewars.com/users/sutuzhko', order: 1 },
          { icon: 'linkedin', url: 'https://www.linkedin.com/in/sutuzhko-bogdan/', order: 2 },
          { icon: 'github', url: 'https://github.com/sutuzhko', order: 3 },
        ],
      },
    },
  });

  // Технологии (из них выводятся фильтры и группы стека)
  // category держим в едином нижнем регистре — на главной он идёт как заголовок
  // группы стека; разнобой («BACKEND» vs «frontend») выглядел бы как баг.
  const techNames = [
    { name: 'TypeScript', category: 'language' },
    { name: 'React', category: 'frontend' },
    { name: 'Vue', category: 'frontend' },
    { name: 'SCSS', category: 'frontend' },
    { name: 'canvas', category: 'frontend' },
    { name: 'css3', category: 'frontend' },
    { name: 'Node.js', category: 'backend' },
    { name: 'Nest.js', category: 'backend' },
    { name: 'vite', category: 'tooling' },
    { name: 'webpack5', category: 'tooling' },
  ];
  const techIds = new Map<string, string>();
  for (const [order, item] of techNames.entries()) {
    const row = await prisma.technology.create({ data: { ...item, order } });
    techIds.set(item.name, row.id);
  }

  // Безопасная выборка id технологии по имени (без non-null assertion).
  const tech = (name: string): { id: string } => {
    const id = techIds.get(name);
    if (!id) throw new Error(`Технология "${name}" не найдена в seed`);
    return { id };
  };

  // Контрибьюторы (общие между проектами, нужны для фильтра на /projects)
  const me = await prisma.contributor.create({
    data: {
      name: L('Богдан Сутужко', 'Bogdan Sutuzhko'),
      image: 'https://avatars.githubusercontent.com/u/61148628?v=4',
      order: 0,
    },
  });
  const martynov = await prisma.contributor.create({
    data: { name: L('Алексей Мартынов', 'Alex Martynov'), order: 1 },
  });

  // Проекты
  await prisma.project.create({
    data: {
      slug: '2048',
      title: L('Игра: 2048', 'Game: 2048'),
      description: L(
        'Классическая головоломка 2048 на TypeScript и Canvas. Запусти прямо здесь — управление стрелками или кнопками.',
        'The classic 2048 puzzle in TypeScript and Canvas. Play it right here — arrow keys or on-screen buttons.',
      ),
      subtitle: L('Головоломка на Canvas', 'A Canvas puzzle'),
      bodyMarkdown: L(
        [
          '## Правила игры',
          '',
          '2048 играется на сетке 4×4 с числами, равными степеням двойки. Каждый ход стрелками выбирается направление, в которое сдвигаются все плитки — пока их не остановит другая плитка или край поля. Две одинаковые плитки при столкновении сливаются в одну с их суммой (за один ход результирующая плитка больше не сливается). После хода в случайной пустой клетке появляется новая плитка: 2 (90%) или 4 (10%).',
          '',
          '## Подсчёт очков',
          '',
          'Каждый ход очки растут на номинал плитки, получившейся при слиянии.',
          '',
          '## Победа и конец игры',
          '',
          'Победа — когда на поле появляется 2048; после этого игру можно продолжить. Игра заканчивается, когда ходов больше не осталось.',
        ].join('\n'),
        [
          '## Rules',
          '',
          '2048 is played on a 4×4 grid of numbers that are powers of two. Each move (arrow keys) picks a direction; all tiles slide that way until stopped by another tile or the board edge. Two equal tiles that collide merge into one with their sum (a merged tile does not merge again on the same move). After each move a new tile appears in a random empty cell: 2 (90%) or 4 (10%).',
          '',
          '## Scoring',
          '',
          'Every move adds the value of each merged tile to your score.',
          '',
          '## Winning & game over',
          '',
          'You win when a 2048 tile appears — you may keep playing. The game ends when no moves are left.',
        ].join('\n'),
      ),
      bullets: {
        ru: [
          'Полная игровая логика: слияние тайлов, подсчёт очков, лучший результат.',
          'Рендеринг сетки и тайлов на Canvas, адаптивная вёрстка поля.',
          'Сохранение рекорда в localStorage.',
        ],
        en: [
          'Full game logic: tile merging, scoring, best result.',
          'Grid and tile rendering on Canvas, responsive board layout.',
          'Best score persisted in localStorage.',
        ],
      },
      category: 'side-project',
      period: '2025',
      tileColor: '#6b4ca8',
      links: [
        { label: L('Открыть', 'Live'), href: 'https://sutuzhko.github.io/2048/' },
        { label: 'GitHub', href: 'https://github.com/sutuzhko/2048' },
      ],
      runnable: true,
      runCommand: 'run 2048',
      embedUrl: 'https://sutuzhko.github.io/2048/',
      runHint: L('Используйте стрелки, чтобы двигать тайлы.', 'Use the arrows to move the tiles.'),
      status: 'PUBLISHED',
      pinned: false,
      order: 0,
      primaryLanguage: { connect: tech('TypeScript') },
      technologies: { connect: [tech('canvas'), tech('css3'), tech('webpack5')] },
      contributors: { connect: [{ id: me.id }] },
      gallery: {
        create: [
          {
            url: '/uploads/2048.png',
            type: 'GALLERY',
            alt: L('Игровое поле 2048', '2048 game board'),
            width: 2880,
            height: 1600,
            mime: 'image/png',
            order: 0,
          },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      slug: 'procharity',
      title: L('Procharity', 'Procharity'),
      description: L(
        'Место, где благотворительные фонды и волонтёры находят друг друга.',
        'A place where charitable foundations and volunteers find each other.',
      ),
      subtitle: L('Платформа для НКО', 'Platform for nonprofits'),
      bodyMarkdown: L(
        '# Роль на проекте\n\nFeature lead сервиса «Регистрация/Профиль НКО».',
        '# Role on the project\n\nFeature lead of the NGO registration/profile service.',
      ),
      role: L('Feature Lead', 'Feature Lead'),
      category: 'commercial',
      period: '2023 — 2024',
      tileColor: '#1d6f74',
      links: [{ label: 'Live', href: 'https://procharity.ru/' }],
      status: 'PUBLISHED',
      pinned: true,
      order: 1,
      primaryLanguage: { connect: tech('TypeScript') },
      technologies: { connect: [tech('React'), tech('SCSS'), tech('vite')] },
      contributors: { connect: [{ id: me.id }, { id: martynov.id }] },
      gallery: {
        create: [
          {
            url: '/uploads/procharity-dashboard.png',
            type: 'GALLERY',
            alt: L('Личный кабинет НКО', 'NGO dashboard'),
            width: 2880,
            height: 1600,
            mime: 'image/png',
            order: 0,
          },
          {
            url: '/uploads/procharity-tasks.png',
            type: 'GALLERY',
            alt: L('Лента задач с фильтрами', 'Task feed with filters'),
            width: 2880,
            height: 1600,
            mime: 'image/png',
            order: 1,
          },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      slug: 'konyom-hodi',
      title: L('Конём ходи', 'Knight Moves'),
      description: L(
        'Образовательная браузерная шахматная система с ИИ-противником на 20 уровнях.',
        'An educational browser chess system with a 20-level AI opponent.',
      ),
      bodyMarkdown: L(
        '# Конём ходи\n\nКлассические шахматы, режим «Шведки», тренажёр задач и собственный движок ИИ.',
        '# Knight Moves\n\nClassic chess, Bughouse mode, a puzzle trainer and a custom AI engine.',
      ),
      category: 'side-project',
      period: '2026',
      tileColor: '#4b6b8a',
      links: [{ label: 'Live', href: 'https://sutuzhko.github.io/chess/' }],
      status: 'PUBLISHED',
      pinned: true,
      order: 2,
      primaryLanguage: { connect: tech('TypeScript') },
      technologies: { connect: [tech('Vue'), tech('SCSS'), tech('vite'), tech('canvas')] },
      contributors: { connect: [{ id: me.id }] },
      gallery: {
        create: [
          {
            url: '/uploads/konyom-hodi-board.png',
            type: 'GALLERY',
            alt: L('Шахматная доска и партия', 'Chess board and a game'),
            width: 2880,
            height: 1600,
            mime: 'image/png',
            order: 0,
          },
          {
            url: '/uploads/konyom-hodi-trainer.png',
            type: 'GALLERY',
            alt: L('Тренажёр шахматных задач', 'Chess puzzle trainer'),
            width: 2880,
            height: 1600,
            mime: 'image/png',
            order: 1,
          },
        ],
      },
    },
  });

  // Опыт работы
  await prisma.experience.create({
    data: {
      company: 'Go Mobile',
      role: L('Frontend-разработчик', 'Frontend Developer'),
      location: L('Москва', 'Moscow'),
      startDate: new Date('2025-06-01'),
      current: true,
      dotColor: '#238636',
      bullets: {
        ru: [
          'Внутренняя финансовая CRM учёта сделок и аналитики потоков: Lighthouse 92%, покрытие тестами бизнес-логики 95%, −20% человеко-часов для байеров, −30%+ для проверки директорами.',
          'Внутренняя платформа управления данными: вынос константных и справочных значений в админку (НДС, курсы валют, кредитные ставки).',
          'Внутренняя HRM-платформа: учёт отпусков, отсутствий и соц.баллов сотрудников.',
          'Внутренние библиотеки для всех проектов компании: eslint-config, logger в связке с Sentry, error-core; начал корпоративный UI-kit для ухода от PrimeVue.',
          'Агрегатор всех продуктов компании — мета-приложение для получения IT-аккредитации.',
        ],
        en: [
          'Internal financial CRM for deal accounting and flow analytics: Lighthouse 92%, 95% business-logic test coverage, −20% man-hours for buyers, −30%+ for director review.',
          'Internal data-management platform: moved constants and reference values into an admin panel (VAT, exchange rates, credit rates).',
          'Internal HRM platform: tracking employees’ vacations, absences and social points.',
          'Internal libraries shared across all company projects: eslint-config, a Sentry-wired logger, error-core; kicked off a corporate UI-kit to move away from PrimeVue.',
          'Aggregator of all company products — a meta-application for obtaining IT accreditation.',
        ],
      },
      tech: { connect: [tech('Vue'), tech('TypeScript'), tech('SCSS'), tech('vite')] },
    },
  });

  await prisma.experience.create({
    data: {
      company: 'Виавей',
      role: L('Frontend-разработчик', 'Frontend Developer'),
      location: L('Москва', 'Moscow'),
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      bullets: {
        ru: [
          'Разработал с нуля фронтенд инвестиционно-крипто платформы по дизайн-макету в pixel-perfect качестве (Next.js 15, App Router): авторизация, профиль с 8-уровневой статусной системой, реферальная сеть, баланс, каталог проектов.',
          'В одиночку создал корпоративный UI-kit: 20+ компонентов (Typography, Button, Input, Select, Tabs, Pagination, Accordion, Swiper и др.) с MDX-документацией в Storybook на базе Radix UI + CVA + TypeScript + SCSS-modules.',
        ],
        en: [
          'Built the frontend of an investment/crypto platform from scratch to pixel-perfect quality from the design mockups (Next.js 15, App Router): auth, a profile with an 8-tier status system, referral network, balance, project catalog.',
          'Single-handedly created a corporate UI-kit: 20+ components (Typography, Button, Input, Select, Tabs, Pagination, Accordion, Swiper, etc.) with MDX docs in Storybook on top of Radix UI + CVA + TypeScript + SCSS modules.',
        ],
      },
      tech: { connect: [tech('React'), tech('TypeScript'), tech('SCSS')] },
    },
  });

  await prisma.experience.create({
    data: {
      company: 'Мастерская Яндекс Практикума',
      role: L('Frontend-разработчик', 'Frontend Developer'),
      location: L('Москва', 'Moscow'),
      sub: L('Procharity — beta'),
      startDate: new Date('2024-05-01'),
      endDate: new Date('2025-02-28'),
      bullets: {
        ru: [
          'Запустил MVP сервисов профиля и регистрации НКО в микрофронтенд-архитектуре (Module Federation, Vite): требования, декомпозиция, код-ревью команды, рефакторинг и документация.',
          'Разработал основные бизнес-фичи: фронтенд на React + TypeScript, интеграция с микросервисным бэкендом (Moleculer, REST API, JWT).',
          'Работал в монорепозитории из 27 workspace-пакетов (Yarn Workspaces) с shared UI-kit (Storybook + Chromatic), общими типами и схемами валидации.',
        ],
        en: [
          'Launched the MVP of the NGO profile and registration services in a micro-frontend architecture (Module Federation, Vite): requirements, decomposition, team code review, refactoring and documentation.',
          'Built the core business features: a React + TypeScript frontend integrated with a microservice backend (Moleculer, REST API, JWT).',
          'Worked in a 27-package monorepo (Yarn Workspaces) with a shared UI-kit (Storybook + Chromatic), shared types and validation schemas.',
        ],
      },
      tech: { connect: [tech('React'), tech('TypeScript'), tech('vite'), tech('SCSS')] },
    },
  });

  // Образование
  await prisma.education.createMany({
    data: [
      {
        type: 'MAIN',
        degree: L(
          'Бакалавр — Фундаментальная информатика и ИТ',
          'Bachelor — Fundamental Informatics and IT',
        ),
        place: L(
          'Азовский государственный педагогический университет',
          'Azov State Pedagogical University',
        ),
        startDate: new Date('2022-09-01'),
        endDate: new Date('2026-06-01'),
      },
      {
        type: 'MAIN',
        degree: L('Бакалавр — Перевод и переводоведение', 'Bachelor — Translation Studies'),
        place: L(
          'Российский государственный гуманитарный университет',
          'Russian State University for the Humanities',
        ),
        startDate: new Date('2014-09-01'),
        endDate: new Date('2018-06-01'),
      },
      {
        type: 'ADDITIONAL',
        degree: L(
          'Fullstack-разработчик — Яндекс Практикум (сертификат)',
          'Fullstack Developer — Yandex Practicum (certificate)',
        ),
        startDate: new Date('2022-09-01'),
        endDate: new Date('2024-07-01'),
      },
    ],
  });

  // Языки
  await prisma.language.createMany({
    data: [
      { name: L('Английский', 'English'), level: 'C1', pct: 90, order: 0 },
      { name: L('Испанский', 'Spanish'), level: 'B1', pct: 55, order: 1 },
    ],
  });

  // Ключевые навыки
  const skillNames = [
    'JavaScript',
    'TypeScript',
    'Vue',
    'React',
    'Next',
    'Node',
    'Jest',
    'Cypress',
    'Storybook',
    'Docker',
  ];
  await prisma.skill.createMany({
    data: skillNames.map((name, order) => ({ name: L(name), order })),
  });

  // База знаний: папки (id заданы явно ради стабильных ссылок parent → child)
  // и статьи с вики-ссылками `[[slug]]` в теле — на них строятся бэклинки.
  await prisma.folder.createMany({
    data: [
      { id: 'frontend', name: L('Frontend'), order: 0, parentId: null },
      { id: 'cs', name: L('Computer Science', 'Computer Science'), order: 1, parentId: null },
      { id: 'js', name: L('JavaScript'), order: 0, parentId: 'frontend' },
      { id: 'react', name: L('React'), order: 1, parentId: 'frontend' },
    ],
  });

  await prisma.article.createMany({
    data: [
      {
        slug: 'javascript-core',
        title: L('JavaScript Core', 'JavaScript Core'),
        tags: ['js', 'core'],
        status: 'PUBLISHED',
        order: 0,
        folderId: 'js',
        bodyMarkdown: L(
          '# JavaScript Core\n\nКонспект по фундаменту языка. Смежные темы: [[event-loop]] и [[prototypes]].\n\n## Замыкания\nФункция запоминает лексическое окружение. Используется в **каррировании** и приватных полях.\n\nСм. также [[typescript]] для типобезопасности.',
          '# JavaScript Core\n\nNotes on the language core. Related: [[event-loop]] and [[prototypes]].\n\nSee also [[typescript]] for type safety.',
        ),
      },
      {
        slug: 'event-loop',
        title: L('Event Loop', 'Event Loop'),
        tags: ['js', 'async'],
        status: 'PUBLISHED',
        order: 1,
        folderId: 'js',
        bodyMarkdown: L(
          '# Event Loop\n\nМикротаски и макротаски. Связано с [[javascript-core]].\n\n1. синхронный стек\n2. микротаски (`Promise`)\n3. макротаски (`setTimeout`)',
          '# Event Loop\n\nMicrotasks and macrotasks. Related to [[javascript-core]].',
        ),
      },
      {
        slug: 'prototypes',
        title: L('Прототипы', 'Prototypes'),
        tags: ['js'],
        status: 'PUBLISHED',
        order: 2,
        folderId: 'js',
        bodyMarkdown: L(
          '# Прототипы\n\nЦепочка прототипов и делегирование. Основа из [[javascript-core]].',
          '# Prototypes\n\nThe prototype chain and delegation. Builds on [[javascript-core]].',
        ),
      },
      {
        slug: 'typescript',
        title: L('TypeScript', 'TypeScript'),
        tags: ['ts'],
        status: 'PUBLISHED',
        order: 0,
        folderId: 'frontend',
        bodyMarkdown: L(
          '# TypeScript\n\nДженерики, utility types, сужение типов. Дополняет [[javascript-core]].',
          '# TypeScript\n\nGenerics, utility types, narrowing. Complements [[javascript-core]].',
        ),
      },
      {
        slug: 'react-rendering',
        title: L('Рендеринг React', 'React Rendering'),
        tags: ['react'],
        status: 'PUBLISHED',
        order: 0,
        folderId: 'react',
        bodyMarkdown: L(
          '# Рендеринг React\n\nReconciliation, fiber и фазы рендера. Опирается на [[javascript-core]].',
          '# React Rendering\n\nReconciliation, fiber and render phases. Relies on [[javascript-core]].',
        ),
      },
      {
        slug: 'big-o',
        title: L('Сложность алгоритмов', 'Algorithmic Complexity'),
        tags: ['cs', 'algorithms'],
        status: 'PUBLISHED',
        order: 0,
        folderId: 'cs',
        bodyMarkdown: L(
          '# Сложность алгоритмов\n\nO-нотация описывает рост времени и памяти. Полезно для интуиции про [[event-loop]].',
          '# Algorithmic Complexity\n\nBig-O describes growth of time and memory. Useful intuition for [[event-loop]].',
        ),
      },
    ],
  });

  await generateGalleryPlaceholders();

  console.log('Seed выполнен.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

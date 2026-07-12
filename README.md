# Portfolio

Портфолио фуллстек-разработчика: публичная часть в эстетике терминала, приватная CRM для наполнения контентом и собственная дизайн-система, вынесенная отдельным npm-пакетом.

Живая версия: https://sutuzhko.space

`React` · `TypeScript` · `Feature-Sliced Design` · `Redux Toolkit / RTK Query` · `NestJS` · `Prisma` · `PostgreSQL` · `Storybook` · `Vitest` · `Playwright` · `Docker`

## Что внутри

Публичная часть - это сайт-резюме: главная с интерактивным героем, проекты, опыт, стек и контакты. Поверх этого работает несколько вещей:

- **Консоль (⌘K)** - bash-подобный интерфейс к сайту. Через неё можно ходить по разделам, переключать тему, скачать резюме, запускать проекты. Все команды собраны в едином реестре, а не разбросаны по коду.
- **Раннер проектов** - реальные проекты запускаются прямо на странице в `<iframe sandbox>`. Ссылка на сборку приходит с бэкенда, поэтому переезд проекта - это правка одного поля в CRM, а не передеплой сайта.
- **Приватная CRM** - восемь вкладок: профиль, проекты, опыт, образование, стек, база знаний, локализация, настройки. Двуязычный контент, загрузка и кадрирование аватара - всё меняется без единой правки кода.
- **База знаний** - приватная вики с `[[wikilink]]`-ссылками и обратными ссылками, которые вычисляются автоматически.
- **Двуязычность** - весь пользовательский контент существует в русском и английском; нужная локаль определяется на бэкенде по `Accept-Language`, а кэш RTK Query сегментируется по языку.
- **Дизайн-система** - [`@sutuzhko/ui-kit`][pkg-ui-kit]: тридцать компонентов, токены в палитре GitHub-dark, светлая тема и документация в Storybook.

## Инженерные решения

- **Границы Feature-Sliced Design проверяются линтером.** `eslint-plugin-boundaries` без TypeScript-резолвера молча ничего не проверял - это починено: теперь ловится и направление зависимостей между слоями, и вход в слайс мимо публичного API.
- **Ротация refresh-токенов** с отзывом при повторном использовании и уникальным `jti` на каждый токен. Токены лежат в HttpOnly-cookie, клиент их не хранит.
- **Контракт генерируется из бэкенда**, CI сравнивает его с закоммиченным. Если типы фронта и бэка разойдутся - сборка упадёт.
- **Доступность** закрыта тестами: `vitest-axe` в unit (падает в CI), `addon-a11y` в историях, семантика вместо `div role=...`, Lighthouse 100.
- **Тесты на всех уровнях:** unit и история на каждый компонент дизайн-системы (в настоящем Chromium), unit и e2e бэкенда против реального Postgres, сквозной сценарий на Playwright.

## Монорепо

| Пакет                               | Что это                                                 |
| ----------------------------------- | ------------------------------------------------------- |
| [`apps/web`][pkg-web]               | фронтенд: React + Vite на Feature-Sliced Design         |
| [`apps/api`][pkg-api]               | бэкенд: NestJS + Prisma + PostgreSQL                    |
| [`packages/ui-kit`][pkg-ui-kit]     | `@sutuzhko/ui-kit` - дизайн-система (публикуется в npm) |
| [`packages/contract`][pkg-contract] | OpenAPI-контракт и общие для фронта и бэка типы         |

## Быстрый старт

Нужны Node.js 20+ (проверено на 24), pnpm 9 и Docker - для локальной базы. Зависимости ставятся один раз:

```bash
pnpm install
```

### Фронтенд

```bash
pnpm --filter @portfolio/web dev:mock   # на MSW-моках, бэкенд не нужен → :5180
pnpm --filter @portfolio/web dev        # на живом бэкенде (нужен pnpm backend)
```

### Дизайн-система

```bash
pnpm ui-kit          # Storybook пакета → :6007
pnpm ui-kit:build    # статическая витрина
```

### Бэкенд с базой

Одной командой, Docker при этом должен быть запущен:

```bash
pnpm backend
```

Скрипт поднимает PostgreSQL, ждёт, пока контейнер станет healthy, генерирует Prisma Client, применяет миграции и запускает API в watch-режиме. Файл `apps/api/.env` уже на месте; если его нет - скопируй пример: `cp apps/api/.env.example apps/api/.env`.

- Health-check: <http://localhost:3000/api/health>
- Swagger UI: <http://localhost:3000/api/docs>
- Примеры данных: `/api/profile?locale=en`, `/api/projects?locale=ru`, `/api/experience`

Засеять базу эталонным контентом (первый запуск или сброс - **перезаписывает данные**):

```bash
pnpm backend:seed
```

Postgres поднимается на `localhost:5432` (база `portfolio`, логин и пароль `postgres`). Seed вынесен в отдельную команду, потому что он разрушительный - полностью пересоздаёт данные, поэтому `pnpm backend` его сам не запускает. Вход в CRM после сидинга - `admin` / `admin12345` (меняется через `ADMIN_USERNAME` / `ADMIN_PASSWORD`).

## Контракт

После изменения эндпоинтов - пересобрать общие типы:

```bash
pnpm contract:generate
```

Команда поднимает API без базы, пишет `packages/contract/openapi.json`, генерирует TypeScript-типы и собирает пакет.

## Тесты и проверки

```bash
pnpm --filter @portfolio/web test       # unit (jsdom) + истории (Chromium)
pnpm --filter @sutuzhko/ui-kit test     # то же для дизайн-системы
pnpm --filter @portfolio/api test       # unit (jest)
pnpm --filter @portfolio/api test:e2e   # e2e против Postgres
pnpm lint                               # eslint по всем пакетам
```

## Релиз дизайн-системы

Версионируется через [Changesets][tech-changesets]:

```bash
pnpm changeset          # описать изменение
pnpm version-packages   # поднять версию + CHANGELOG
pnpm release            # собрать и опубликовать в npm
```

## Деплой

Прод разворачивается тремя контейнерами - PostgreSQL, NestJS и Caddy (авто-HTTPS, он же раздаёт собранный фронт и проксирует API).

## Частые проблемы

- **`Can't reach database server at localhost:5432`** - база не запущена: `docker compose up -d`.
- **Порт 5432 занят** - уже поднят другой Postgres; останови его или поменяй порт в `docker-compose.yml` и `DATABASE_URL`.
- **Правки в CRM не сохраняются** - запущен `dev:mock`, и MSW перехватывает `PATCH`. Для работы с реальной базой нужен `pnpm dev` вместе с `pnpm backend`.

---

Автор - [Богдан Сутужко][author-github]

[//]: # 'Автор'
[author-github]: https://github.com/sutuzhko
[//]: # 'Пакеты монорепо'
[pkg-web]: ./apps/web
[pkg-api]: ./apps/api
[pkg-ui-kit]: ./packages/ui-kit
[pkg-contract]: ./packages/contract
[//]: # 'Технологии'
[tech-changesets]: https://github.com/changesets/changesets

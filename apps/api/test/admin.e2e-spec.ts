import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './../src/app.module';

// e2e admin write API (Фаза 4). Требует поднятую и засеянную БД (`pnpm backend:seed`).
// Проверяем гейтинг (401/400) и сквозной CRUD на простых сущностях.
describe('Admin write API (e2e)', () => {
  let app: INestApplication<App>;

  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const password = process.env.ADMIN_PASSWORD ?? 'admin12345';
  let cookies = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password })
      .expect(200);
    const setCookie = res.headers['set-cookie'] as unknown as string[] | undefined;
    cookies = (setCookie ?? []).map((raw) => raw.split(';')[0]).join('; ');
  });

  afterAll(async () => {
    await app.close();
  });

  it('закрывает запись без авторизации (401)', async () => {
    await request(app.getHttpServer()).patch('/api/settings').send({ siteTitle: 'X' }).expect(401);
    await request(app.getHttpServer())
      .post('/api/skills')
      .send({ name: { ru: 'X' } })
      .expect(401);
    await request(app.getHttpServer()).get('/api/profile/admin').expect(401);
  });

  it('валидирует тело (400) — отклоняет неизвестные поля и неверные типы', async () => {
    await request(app.getHttpServer())
      .post('/api/skills')
      .set('Cookie', cookies)
      .send({ name: { ru: 'Y' }, bogus: 1 })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/languages')
      .set('Cookie', cookies)
      .send({ name: { ru: 'Z' }, level: 'B2', pct: 200 })
      .expect(400);
  });

  it('PATCH /settings обновляет синглтон (строка + булев тумблер)', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/settings')
      .set('Cookie', cookies)
      .send({ siteTitle: 'Portfolio', consoleGlow: false })
      .expect(200);
    const body = res.body as { siteTitle: string; consoleGlow: boolean };
    expect(body.siteTitle).toBe('Portfolio');
    expect(body.consoleGlow).toBe(false);
    // вернём дефолт, чтобы не влиять на другие прогоны
    await request(app.getHttpServer())
      .patch('/api/settings')
      .set('Cookie', cookies)
      .send({ siteTitle: 'bogdan.sutuzhko', consoleGlow: true })
      .expect(200);
  });

  it('CRUD навыка: create → admin list (обе локали) → patch → delete', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/skills')
      .set('Cookie', cookies)
      .send({ name: { ru: 'Тест-навык', en: 'Test skill' }, order: 99 })
      .expect(201);
    const id = (created.body as { id: string; name: { ru: string; en?: string } }).id;
    expect((created.body as { name: { ru: string; en?: string } }).name).toEqual({
      ru: 'Тест-навык',
      en: 'Test skill',
    });

    const adminList = await request(app.getHttpServer())
      .get('/api/skills/admin')
      .set('Cookie', cookies)
      .expect(200);
    expect((adminList.body as Array<{ id: string }>).some((s) => s.id === id)).toBe(true);

    const patched = await request(app.getHttpServer())
      .patch(`/api/skills/${id}`)
      .set('Cookie', cookies)
      .send({ name: { ru: 'Обновлён', en: 'Updated' } })
      .expect(200);
    expect((patched.body as { name: { ru: string } }).name.ru).toBe('Обновлён');

    // публичный список отдаёт строку нужной локали
    const publicEn = await request(app.getHttpServer()).get('/api/skills?locale=en').expect(200);
    expect(
      (publicEn.body as Array<{ id: string; name: string }>).find((s) => s.id === id)?.name,
    ).toBe('Updated');

    await request(app.getHttpServer())
      .delete(`/api/skills/${id}`)
      .set('Cookie', cookies)
      .expect(204);
    await request(app.getHttpServer())
      .patch(`/api/skills/${id}`)
      .set('Cookie', cookies)
      .send({ order: 1 })
      .expect(404);
  });

  it('PATCH /profile пишет обе локали и проставляет bioUpdatedAt', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/profile')
      .set('Cookie', cookies)
      .send({ roleTitle: { ru: 'Тест-роль', en: 'Test role' } })
      .expect(200);
    const body = res.body as { roleTitle: { ru: string; en?: string } };
    expect(body.roleTitle).toEqual({ ru: 'Тест-роль', en: 'Test role' });

    // вернём исходное значение из сида
    await request(app.getHttpServer())
      .patch('/api/profile')
      .set('Cookie', cookies)
      .send({ roleTitle: { ru: 'Fullstack-разработчик', en: 'Fullstack Developer' } })
      .expect(200);
  });

  it('PATCH /profile: имя локализовано, мёрж одной локали не затирает вторую', async () => {
    await request(app.getHttpServer())
      .patch('/api/profile')
      .set('Cookie', cookies)
      .send({ name: { ru: 'Тест-имя', en: 'Test name' } })
      .expect(200);

    // патч только ru — сохранённая en остаётся (мёрж локали)
    const res = await request(app.getHttpServer())
      .patch('/api/profile')
      .set('Cookie', cookies)
      .send({ name: { ru: 'Другое имя' } })
      .expect(200);
    expect((res.body as { name: { ru: string; en?: string } }).name).toEqual({
      ru: 'Другое имя',
      en: 'Test name',
    });

    // публичный ответ локализуется по Accept-Language
    const publicEn = await request(app.getHttpServer())
      .get('/api/profile')
      .set('Accept-Language', 'en-US,en;q=0.9')
      .expect(200);
    expect((publicEn.body as { name: string }).name).toBe('Test name');

    // вернём исходное значение из сида
    await request(app.getHttpServer())
      .patch('/api/profile')
      .set('Cookie', cookies)
      .send({ name: { ru: 'Богдан Сутужко', en: 'Bogdan Sutuzhko' } })
      .expect(200);
  });

  it('PATCH /profile пишет cvUrl, highlights и интро экранов', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/profile')
      .set('Cookie', cookies)
      .send({
        cvUrl: { ru: '/uploads/cv/test.pdf', en: '/uploads/cv/test-en.pdf' },
        highlights: [{ value: '5+', label: { ru: 'лет опыта', en: 'years' } }],
        contactIntro: { ru: 'Пишите', en: 'Reach out' },
      })
      .expect(200);
    const body = res.body as {
      cvUrl: { ru: string; en?: string } | null;
      highlights: Array<{ value: string; label: { ru: string; en?: string } }>;
      contactIntro: { ru: string; en?: string } | null;
    };
    expect(body.cvUrl).toEqual({ ru: '/uploads/cv/test.pdf', en: '/uploads/cv/test-en.pdf' });
    expect(body.highlights).toEqual([{ value: '5+', label: { ru: 'лет опыта', en: 'years' } }]);
    expect(body.contactIntro).toEqual({ ru: 'Пишите', en: 'Reach out' });

    // публичный ответ локализует по заголовку Accept-Language (путь фронтенда)
    const publicRes = await request(app.getHttpServer())
      .get('/api/profile')
      .set('Accept-Language', 'en-US,en;q=0.9')
      .expect(200);
    const publicBody = publicRes.body as {
      highlights: Array<{ value: string; label: string }>;
      contactIntro: string | null;
    };
    expect(publicBody.highlights).toEqual([{ value: '5+', label: 'years' }]);
    expect(publicBody.contactIntro).toBe('Reach out');
  });

  it('CRUD проекта со связями (technologies/contributors) + публичная видимость по статусу', async () => {
    const techs = (
      await request(app.getHttpServer()).get('/api/technologies/admin').set('Cookie', cookies)
    ).body as Array<{ id: string }>;
    const contributors = (
      await request(app.getHttpServer()).get('/api/contributors/admin').set('Cookie', cookies)
    ).body as Array<{ id: string }>;
    const techId = techs[0]?.id ?? '';
    const contribId = contributors[0]?.id ?? '';

    // несуществующая связь → 400
    await request(app.getHttpServer())
      .post('/api/projects')
      .set('Cookie', cookies)
      .send({
        slug: 'e2e-temp',
        title: { ru: 'Временный' },
        description: { ru: 'Описание' },
        bodyMarkdown: { ru: 'Тело' },
        technologyIds: ['missing-id'],
      })
      .expect(400);

    const created = await request(app.getHttpServer())
      .post('/api/projects')
      .set('Cookie', cookies)
      .send({
        slug: 'e2e-temp',
        title: { ru: 'Временный', en: 'Temp' },
        description: { ru: 'Описание', en: 'Desc' },
        bodyMarkdown: { ru: 'Тело', en: 'Body' },
        bullets: { ru: ['а', 'б'], en: ['a', 'b'] },
        links: [{ label: { ru: 'Сайт', en: 'Site' }, href: 'https://example.com' }],
        status: 'DRAFT',
        technologyIds: [techId],
        contributorIds: [contribId],
      })
      .expect(201);
    const project = created.body as { id: string; slug: string; technologyIds: string[] };
    expect(project.technologyIds).toEqual([techId]);

    // дубликат slug → 409
    await request(app.getHttpServer())
      .post('/api/projects')
      .set('Cookie', cookies)
      .send({
        slug: 'e2e-temp',
        title: { ru: 'X' },
        description: { ru: 'X' },
        bodyMarkdown: { ru: 'X' },
      })
      .expect(409);

    // DRAFT не виден публично
    await request(app.getHttpServer()).get('/api/projects/e2e-temp').expect(404);

    // публикуем → виден
    await request(app.getHttpServer())
      .patch(`/api/projects/${project.id}`)
      .set('Cookie', cookies)
      .send({ status: 'PUBLISHED' })
      .expect(200);
    const publicView = await request(app.getHttpServer())
      .get('/api/projects/e2e-temp?locale=en')
      .expect(200);
    expect((publicView.body as { title: string }).title).toBe('Temp');

    await request(app.getHttpServer())
      .delete(`/api/projects/${project.id}`)
      .set('Cookie', cookies)
      .expect(204);
    await request(app.getHttpServer()).get('/api/projects/e2e-temp').expect(404);
  });

  it('CRUD опыта с датами и связью технологий', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/experience')
      .set('Cookie', cookies)
      .send({
        role: { ru: 'Разработчик', en: 'Developer' },
        company: 'ACME',
        bullets: { ru: ['делал'], en: ['did'] },
        startDate: '2020-01-01',
        current: true,
      })
      .expect(201);
    const exp = created.body as { id: string; startDate: string; current: boolean };
    expect(exp.current).toBe(true);
    expect(exp.startDate.startsWith('2020-01-01')).toBe(true);

    await request(app.getHttpServer())
      .patch(`/api/experience/${exp.id}`)
      .set('Cookie', cookies)
      .send({ current: false, endDate: '2022-06-01' })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/experience/${exp.id}`)
      .set('Cookie', cookies)
      .expect(204);
  });

  it('CRUD базы знаний: папка + статья, slug-конфликт, защита непустой папки', async () => {
    const folder = (
      await request(app.getHttpServer())
        .post('/api/database/folders')
        .set('Cookie', cookies)
        .send({ name: { ru: 'E2E-папка', en: 'E2E folder' } })
        .expect(201)
    ).body as { id: string };

    const article = (
      await request(app.getHttpServer())
        .post('/api/database/articles')
        .set('Cookie', cookies)
        .send({
          slug: 'e2e-article',
          title: { ru: 'Статья', en: 'Article' },
          bodyMarkdown: { ru: 'Тело [[javascript-core]]', en: 'Body' },
          folderId: folder.id,
          status: 'PUBLISHED',
        })
        .expect(201)
    ).body as { id: string };

    // дубликат slug → 409
    await request(app.getHttpServer())
      .post('/api/database/articles')
      .set('Cookie', cookies)
      .send({ slug: 'e2e-article', title: { ru: 'X' }, bodyMarkdown: { ru: 'X' } })
      .expect(409);

    // нельзя удалить непустую папку
    await request(app.getHttpServer())
      .delete(`/api/database/folders/${folder.id}`)
      .set('Cookie', cookies)
      .expect(400);

    // admin-чтение статьи по id отдаёт обе локали
    const adminRead = await request(app.getHttpServer())
      .get(`/api/database/articles/admin/${article.id}`)
      .set('Cookie', cookies)
      .expect(200);
    expect((adminRead.body as { title: { en?: string } }).title.en).toBe('Article');

    // чистим: статья → папка
    await request(app.getHttpServer())
      .delete(`/api/database/articles/${article.id}`)
      .set('Cookie', cookies)
      .expect(204);
    await request(app.getHttpServer())
      .delete(`/api/database/folders/${folder.id}`)
      .set('Cookie', cookies)
      .expect(204);
  });
});

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './../src/app.module';

// e2e базы знаний (приватная зона). Требует поднятую и засеянную БД (`pnpm backend:seed`).
// Проверяем гейтинг (401 без логина), дерево и статью с бэклинками под логином.
describe('Database / knowledge base (e2e)', () => {
  let app: INestApplication<App>;

  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const password = process.env.ADMIN_PASSWORD ?? 'admin12345';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const login = async (): Promise<string> => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password })
      .expect(200);
    const setCookie = res.headers['set-cookie'] as unknown as string[] | undefined;
    return (setCookie ?? []).map((raw) => raw.split(';')[0]).join('; ');
  };

  it('закрыта без авторизации (401)', async () => {
    await request(app.getHttpServer()).get('/api/database/tree').expect(401);
    await request(app.getHttpServer()).get('/api/database/articles/javascript-core').expect(401);
  });

  it('возвращает дерево папок со статьями под логином', async () => {
    const cookies = await login();
    const res = await request(app.getHttpServer())
      .get('/api/database/tree')
      .set('Cookie', cookies)
      .expect(200);

    const body = res.body as {
      folders: Array<{ id: string; name: string; children: unknown[]; articles: unknown[] }>;
      rootArticles: unknown[];
    };
    expect(Array.isArray(body.folders)).toBe(true);
    const frontend = body.folders.find((f) => f.id === 'frontend');
    expect(frontend).toBeDefined();
    // Вложенность: js и react — подпапки frontend.
    expect(frontend?.children.length).toBeGreaterThanOrEqual(2);
  });

  it('отдаёт статью с бэклинками и хлебными крошками', async () => {
    const cookies = await login();
    const res = await request(app.getHttpServer())
      .get('/api/database/articles/javascript-core')
      .set('Cookie', cookies)
      .expect(200);

    const body = res.body as {
      slug: string;
      title: string;
      bodyMarkdown: string;
      breadcrumb: string[];
      backlinks: Array<{ slug: string; title: string }>;
    };
    expect(body.slug).toBe('javascript-core');
    expect(body.breadcrumb).toEqual(['Frontend', 'JavaScript']);
    // На javascript-core ссылаются event-loop, prototypes, typescript, react-rendering.
    const backlinkSlugs = body.backlinks.map((b) => b.slug).sort();
    expect(backlinkSlugs).toEqual(
      ['event-loop', 'prototypes', 'react-rendering', 'typescript'].sort(),
    );
  });

  it('возвращает локализованный контент по ?locale=en', async () => {
    const cookies = await login();
    const res = await request(app.getHttpServer())
      .get('/api/database/articles/prototypes?locale=en')
      .set('Cookie', cookies)
      .expect(200);
    expect((res.body as { title: string }).title).toBe('Prototypes');
  });

  it('404 на несуществующий slug', async () => {
    const cookies = await login();
    await request(app.getHttpServer())
      .get('/api/database/articles/does-not-exist')
      .set('Cookie', cookies)
      .expect(404);
  });
});

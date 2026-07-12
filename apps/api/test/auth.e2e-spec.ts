import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './../src/app.module';

// e2e критичного потока авторизации. Требует поднятую и засеянную БД (`pnpm backend:seed`)
// с учёткой ADMIN_USERNAME/ADMIN_PASSWORD (по умолчанию admin / admin12345).
describe('Auth (e2e)', () => {
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

  // Собирает заголовок Cookie из Set-Cookie ответа (берём пару name=value до первой `;`).
  const collectCookies = (setCookie: string[] | undefined): string =>
    (setCookie ?? []).map((raw) => raw.split(';')[0]).join('; ');

  const login = async (): Promise<string> => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password })
      .expect(200);

    expect(res.body).toMatchObject({ username, role: 'ADMIN' });
    const setCookie = res.headers['set-cookie'] as unknown as string[] | undefined;
    expect(setCookie?.some((c) => c.startsWith('access_token='))).toBe(true);
    expect(setCookie?.some((c) => c.startsWith('refresh_token='))).toBe(true);
    return collectCookies(setCookie);
  };

  it('отклоняет неверные учётные данные (401)', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password: 'wrong-password' })
      .expect(401);
  });

  it('валидирует тело запроса (400)', async () => {
    await request(app.getHttpServer()).post('/api/auth/login').send({ username }).expect(400);
  });

  it('GET /api/auth/me без авторизации возвращает 401', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('логин → me → refresh (ротация) → logout', async () => {
    const cookies = await login();

    const me = await request(app.getHttpServer()).get('/api/auth/me').set('Cookie', cookies);
    expect(me.status).toBe(200);
    expect(me.body).toMatchObject({ username, role: 'ADMIN' });

    const refreshed = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', cookies)
      .expect(200);
    const rotated = collectCookies(refreshed.headers['set-cookie'] as unknown as string[]);
    expect(rotated).toContain('access_token=');

    // Старый refresh-токен после ротации больше не действует.
    await request(app.getHttpServer()).post('/api/auth/refresh').set('Cookie', cookies).expect(401);

    await request(app.getHttpServer()).post('/api/auth/logout').set('Cookie', rotated).expect(204);

    // После logout новый refresh-токен тоже отозван.
    await request(app.getHttpServer()).post('/api/auth/refresh').set('Cookie', rotated).expect(401);
  });

  it('смена пароля требует авторизации (401)', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/change-password')
      .send({ currentPassword: password, newPassword: 'whatever12345' })
      .expect(401);
  });

  it('смена пароля: короткий новый пароль отклоняется (400)', async () => {
    const cookies = await login();
    await request(app.getHttpServer())
      .post('/api/auth/change-password')
      .set('Cookie', cookies)
      .send({ currentPassword: password, newPassword: 'short' })
      .expect(400);
  });

  it('смена пароля: неверный текущий пароль отклоняется (401)', async () => {
    const cookies = await login();
    await request(app.getHttpServer())
      .post('/api/auth/change-password')
      .set('Cookie', cookies)
      .send({ currentPassword: 'wrong-password', newPassword: 'newpassword12345' })
      .expect(401);
  });

  it('смена пароля: старый перестаёт работать, новый работает (и восстанавливаем)', async () => {
    const newPassword = 'newpassword12345';
    const cookies = await login();

    await request(app.getHttpServer())
      .post('/api/auth/change-password')
      .set('Cookie', cookies)
      .send({ currentPassword: password, newPassword })
      .expect(204);

    // Старый пароль больше не подходит, новый — да.
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password })
      .expect(401);
    const withNew = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password: newPassword })
      .expect(200);

    // Возвращаем исходный пароль, чтобы не портить засеянное состояние БД.
    const newCookies = collectCookies(withNew.headers['set-cookie'] as unknown as string[]);
    await request(app.getHttpServer())
      .post('/api/auth/change-password')
      .set('Cookie', newCookies)
      .send({ currentPassword: newPassword, newPassword: password })
      .expect(204);
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password })
      .expect(200);
  });
});

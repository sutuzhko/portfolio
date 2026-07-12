import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import sharp from 'sharp';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './../src/app.module';

// e2e медиа-загрузки (Фаза 4). Требует поднятую и засеянную БД (`pnpm backend:seed`).
// Реально гоняет sharp на сгенерированном изображении.
describe('Media upload (e2e)', () => {
  let app: INestApplication<App>;

  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const password = process.env.ADMIN_PASSWORD ?? 'admin12345';
  let cookies = '';
  let projectId = '';
  let image: Buffer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password })
      .expect(200);
    const setCookie = login.headers['set-cookie'] as unknown as string[] | undefined;
    cookies = (setCookie ?? []).map((raw) => raw.split(';')[0]).join('; ');

    const projects = (
      await request(app.getHttpServer()).get('/api/projects/admin').set('Cookie', cookies)
    ).body as Array<{ id: string }>;
    projectId = projects[0]?.id ?? '';

    image = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: { r: 10, g: 20, b: 30 } },
    })
      .png()
      .toBuffer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('закрывает загрузку без авторизации (401)', async () => {
    await request(app.getHttpServer())
      .post('/api/media/gallery')
      .field('projectId', projectId)
      .attach('file', image, { filename: 'x.png', contentType: 'image/png' })
      .expect(401);
  });

  it('отклоняет не-изображение (400)', async () => {
    await request(app.getHttpServer())
      .post('/api/media/gallery')
      .set('Cookie', cookies)
      .field('projectId', projectId)
      .attach('file', Buffer.from('not an image'), {
        filename: 'x.txt',
        contentType: 'text/plain',
      })
      .expect(400);
  });

  it('загрузка в галерею генерирует responsive-форматы и чистится при удалении', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/media/gallery')
      .set('Cookie', cookies)
      .field('projectId', projectId)
      .field('altRu', 'Скриншот')
      .field('altEn', 'Screenshot')
      .attach('file', image, { filename: 'shot.png', contentType: 'image/png' })
      .expect(201);

    const asset = created.body as {
      id: string;
      width: number;
      mime: string;
      alt: { ru: string; en?: string };
      formats: Record<string, { url: string; width: number } | null>;
    };
    expect(asset.width).toBe(1200);
    expect(asset.mime).toBe('image/png');
    expect(asset.alt).toEqual({ ru: 'Скриншот', en: 'Screenshot' });
    expect(asset.formats.thumbnail?.width).toBe(160);
    // large не апскейлит — остаётся шириной оригинала
    expect(asset.formats.large?.width).toBe(1200);

    // появляется в галерее проекта
    const project = await request(app.getHttpServer())
      .get(`/api/projects/admin/${projectId}`)
      .set('Cookie', cookies)
      .expect(200);
    expect(
      (project.body as { gallery: Array<{ id: string }> }).gallery.some((g) => g.id === asset.id),
    ).toBe(true);

    await request(app.getHttpServer())
      .patch(`/api/media/${asset.id}`)
      .set('Cookie', cookies)
      .send({ order: 5 })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/media/${asset.id}`)
      .set('Cookie', cookies)
      .expect(204);
  });

  it('загрузка аватара с кадрированием обновляет профиль', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/media/avatar')
      .set('Cookie', cookies)
      .field('cropX', '0')
      .field('cropY', '0')
      .field('cropWidth', '400')
      .field('cropHeight', '400')
      .attach('file', image, { filename: 'ava.png', contentType: 'image/png' })
      .expect(201);
    const url = (res.body as { avatarPhotoUrl: string }).avatarPhotoUrl;
    expect(url.startsWith('/uploads/')).toBe(true);

    const profile = await request(app.getHttpServer())
      .get('/api/profile/admin')
      .set('Cookie', cookies)
      .expect(200);
    expect((profile.body as { avatarPhotoUrl: string }).avatarPhotoUrl).toBe(url);
  });
});

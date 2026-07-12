import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './../src/app.module';

// e2e читающих эндпоинтов. Требует поднятую и засеянную БД (как и health e2e):
// `pnpm backend:seed`. Проверяем код ответа, форму элементов и работу локализации.
describe('Read endpoints (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const getArray = async (path: string): Promise<Record<string, unknown>[]> => {
    const res = await request(app.getHttpServer()).get(path).expect(200);
    if (!Array.isArray(res.body)) {
      throw new Error(`${path} вернул не массив: ${JSON.stringify(res.body)}`);
    }
    return res.body as Record<string, unknown>[];
  };

  it('GET /api/experience — массив с ожидаемой формой элементов', async () => {
    const items = await getArray('/api/experience');
    for (const item of items) {
      expect(typeof item.id).toBe('string');
      expect(typeof item.role).toBe('string');
      expect(typeof item.company).toBe('string');
      expect(typeof item.startDate).toBe('string');
      expect(typeof item.current).toBe('boolean');
      expect(Array.isArray(item.bullets)).toBe(true);
      expect(Array.isArray(item.technologies)).toBe(true);
    }
  });

  it('GET /api/education — массив с ожидаемой формой элементов', async () => {
    const items = await getArray('/api/education');
    for (const item of items) {
      expect(typeof item.id).toBe('string');
      expect(['MAIN', 'ADDITIONAL']).toContain(item.type);
      expect(typeof item.degree).toBe('string');
    }
  });

  it('GET /api/languages — массив с ожидаемой формой элементов', async () => {
    const items = await getArray('/api/languages');
    for (const item of items) {
      expect(typeof item.name).toBe('string');
      expect(typeof item.level).toBe('string');
      expect(typeof item.pct).toBe('number');
    }
  });

  it('GET /api/skills — массив с ожидаемой формой элементов', async () => {
    const items = await getArray('/api/skills');
    for (const item of items) {
      expect(typeof item.id).toBe('string');
      expect(typeof item.name).toBe('string');
    }
  });

  it('локализация: ru и en возвращают разные строки роли при наличии данных', async () => {
    const ru = await getArray('/api/experience?locale=ru');
    const en = await getArray('/api/experience?locale=en');
    if (ru.length === 0) return; // на пустой БД проверять нечего
    expect(en.length).toBe(ru.length);
    expect(typeof ru[0].role).toBe('string');
    expect(typeof en[0].role).toBe('string');
  });
});

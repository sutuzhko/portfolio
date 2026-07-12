import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { Response } from 'express';

import { TokenService } from './token.service';
import type { JwtPayload } from './types/jwt-payload';

const ENV: Record<string, string> = {
  JWT_ACCESS_SECRET: 'access-secret',
  JWT_REFRESH_SECRET: 'refresh-secret',
  JWT_ACCESS_TTL: '15m',
  JWT_REFRESH_TTL: '30d',
};

const buildConfig = (env: Record<string, string>): ConfigService =>
  ({
    get: <T>(key: string): T | undefined => env[key] as T | undefined,
    getOrThrow: <T>(key: string): T => {
      const value = env[key];
      if (value === undefined) throw new Error(`Нет переменной ${key}`);
      return value as T;
    },
  }) as unknown as ConfigService;

const createService = async (env: Record<string, string> = ENV): Promise<TokenService> => {
  const moduleRef = await Test.createTestingModule({
    imports: [JwtModule.register({})],
    providers: [TokenService, { provide: ConfigService, useValue: buildConfig(env) }],
  }).compile();
  return moduleRef.get(TokenService);
};

const payload: JwtPayload = { sub: 'user-1', username: 'admin', role: 'ADMIN' };

describe('TokenService', () => {
  it('подписывает и проверяет access-токен', async () => {
    const service = await createService();
    const token = await service.signAccess(payload);
    await expect(service.verifyAccess(token)).resolves.toMatchObject(payload);
  });

  it('не принимает access-токен секретом refresh (разные ключи)', async () => {
    const service = await createService();
    const token = await service.signAccess(payload);
    await expect(service.verifyRefresh(token)).rejects.toBeDefined();
  });

  it('hashRefresh детерминирован и не возвращает исходный токен', async () => {
    const service = await createService();
    const token = await service.signRefresh(payload);
    const hash = service.hashRefresh(token);
    expect(hash).toBe(service.hashRefresh(token));
    expect(hash).not.toContain(token);
    expect(hash).toHaveLength(64);
  });

  it('падает при неверном формате TTL', async () => {
    await expect(createService({ ...ENV, JWT_ACCESS_TTL: 'soon' })).rejects.toThrow();
  });

  it('выставляет HttpOnly-cookie с токенами', async () => {
    const service = await createService();
    const calls: Array<{ name: string; value: string }> = [];
    const res = {
      cookie: (name: string, value: string): void => {
        calls.push({ name, value });
      },
    } as unknown as Response;

    service.setAuthCookies(res, 'access-token', 'refresh-token');

    expect(calls).toEqual([
      { name: 'access_token', value: 'access-token' },
      { name: 'refresh_token', value: 'refresh-token' },
    ]);
  });
});

import { createHash, randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { CookieOptions, Response } from 'express';

import { ACCESS_COOKIE, REFRESH_COOKIE, REFRESH_COOKIE_PATH } from './auth.cookies';
import type { JwtPayload } from './types/jwt-payload';

const DEFAULT_ACCESS_TTL = '15m';
const DEFAULT_REFRESH_TTL = '30d';

const UNIT_SECONDS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };

// Парсит длительность вида `15m` / `30d` в секунды (используем и для JWT, и для maxAge cookie).
function parseDurationSeconds(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    throw new Error(`Неверный формат длительности токена: "${value}"`);
  }
  const amount = Number(match[1] ?? '');
  const unitSeconds = UNIT_SECONDS[match[2] ?? ''];
  if (!Number.isFinite(amount) || unitSeconds === undefined) {
    throw new Error(`Неверный формат длительности токена: "${value}"`);
  }
  return amount * unitSeconds;
}

/**
 * Подпись и проверка токенов + управление cookie. Доступ и refresh подписываются
 * разными секретами, чтобы токены нельзя было подменить между потоками.
 */
@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessTtlSeconds: number;
  private readonly refreshTtlSeconds: number;
  private readonly isProduction: boolean;

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.accessSecret = config.getOrThrow<string>('JWT_ACCESS_SECRET');
    this.refreshSecret = config.getOrThrow<string>('JWT_REFRESH_SECRET');
    this.accessTtlSeconds = parseDurationSeconds(
      config.get<string>('JWT_ACCESS_TTL') ?? DEFAULT_ACCESS_TTL,
    );
    this.refreshTtlSeconds = parseDurationSeconds(
      config.get<string>('JWT_REFRESH_TTL') ?? DEFAULT_REFRESH_TTL,
    );
    this.isProduction = config.get<string>('NODE_ENV') === 'production';
  }

  signAccess(payload: JwtPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessTtlSeconds,
    });
  }

  signRefresh(payload: JwtPayload): Promise<string> {
    // Уникальный jti гарантирует, что два refresh-токена, выпущенные в одну секунду
    // с одинаковой нагрузкой (логин → сразу refresh), не совпадут байт-в-байт.
    return this.jwt.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshTtlSeconds,
      jwtid: randomUUID(),
    });
  }

  verifyAccess(token: string): Promise<JwtPayload> {
    return this.jwt.verifyAsync<JwtPayload>(token, { secret: this.accessSecret });
  }

  verifyRefresh(token: string): Promise<JwtPayload> {
    return this.jwt.verifyAsync<JwtPayload>(token, { secret: this.refreshSecret });
  }

  // В БД храним только sha256-хэш refresh-токена: сам JWT подписан, хэш нужен лишь
  // для поиска и отзыва конкретной сессии.
  hashRefresh(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  refreshExpiresAt(): Date {
    return new Date(Date.now() + this.refreshTtlSeconds * 1000);
  }

  setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    res.cookie(ACCESS_COOKIE, accessToken, this.cookieOptions(this.accessTtlSeconds, '/'));
    res.cookie(
      REFRESH_COOKIE,
      refreshToken,
      this.cookieOptions(this.refreshTtlSeconds, REFRESH_COOKIE_PATH),
    );
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_COOKIE, this.cookieOptions(0, '/'));
    res.clearCookie(REFRESH_COOKIE, this.cookieOptions(0, REFRESH_COOKIE_PATH));
  }

  private cookieOptions(ttlSeconds: number, path: string): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      path,
      maxAge: ttlSeconds * 1000,
    };
  }
}

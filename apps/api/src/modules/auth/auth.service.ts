import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUserDto } from './dto/auth-user.dto';
import { TokenService } from './token.service';
import type { JwtPayload } from './types/jwt-payload';

// Стоимость bcrypt — та же, что при сидинге администратора (см. prisma/seed.ts).
const BCRYPT_ROUNDS = 12;

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface AuthResult {
  readonly user: AuthUserDto;
  readonly tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async login(username: string, password: string): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }
    return this.issueSession(user);
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const payload = await this.verifyRefreshToken(refreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.tokenService.hashRefresh(refreshToken) },
    });
    if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Сессия недействительна');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    // Ротация: гасим использованный refresh-токен и выдаём новую пару.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    return this.issueSession(user);
  }

  /**
   * Смена пароля залогиненного пользователя. Проверяет текущий пароль, сохраняет
   * хеш нового и отзывает ВСЕ его refresh-токены — активные сессии на других
   * устройствах становятся недействительными (стандартное поведение при смене пароля).
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Неверный текущий пароль');
    }
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    // updateMany не падает, если токен уже отозван или отсутствует.
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.tokenService.hashRefresh(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
    try {
      return await this.tokenService.verifyRefresh(refreshToken);
    } catch {
      throw new UnauthorizedException('Недействительный refresh-токен');
    }
  }

  private async issueSession(user: User): Promise<AuthResult> {
    const payload: JwtPayload = { sub: user.id, username: user.username, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccess(payload),
      this.tokenService.signRefresh(payload),
    ]);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.tokenService.hashRefresh(refreshToken),
        userId: user.id,
        expiresAt: this.tokenService.refreshExpiresAt(),
      },
    });

    return {
      user: { id: user.id, username: user.username, role: user.role },
      tokens: { accessToken, refreshToken },
    };
  }
}

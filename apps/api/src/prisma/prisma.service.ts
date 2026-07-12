import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma подключается лениво при первом запросе — приложение стартует даже без БД
 * (удобно для фронт-трека и генерации контракта). Доступность базы показывает
 * GET /api/health, а не падение на старте.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

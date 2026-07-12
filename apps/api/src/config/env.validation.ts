import { plainToInstance } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  DATABASE_URL: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(65535)
  PORT?: number;

  @IsOptional()
  @IsString()
  NODE_ENV?: string;

  // Логины для прокси внешней статистики; при отсутствии берётся значение по умолчанию в сервисе.
  @IsOptional()
  @IsString()
  GITHUB_USERNAME?: string;

  @IsOptional()
  @IsString()
  CODEWARS_USERNAME?: string;

  // Секреты подписи JWT. Разные ключи для access и refresh, чтобы токены нельзя было
  // подменять между потоками. В проде обязаны приходить из окружения.
  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  // Время жизни токенов в формате `ms`/`vercel` (например `15m`, `30d`).
  @IsOptional()
  @IsString()
  JWT_ACCESS_TTL?: string;

  @IsOptional()
  @IsString()
  JWT_REFRESH_TTL?: string;

  // Учётка владельца для сидирования приватной зоны (роль ADMIN).
  @IsOptional()
  @IsString()
  ADMIN_USERNAME?: string;

  @IsOptional()
  @IsString()
  ADMIN_PASSWORD?: string;

  // Каталог для загруженных файлов (local-хранилище). По умолчанию ./uploads.
  @IsOptional()
  @IsString()
  UPLOAD_DIR?: string;
}

// Проверяет переменные окружения при старте приложения; падаем сразу, если конфиг невалиден.
export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(
      `Невалидные переменные окружения:\n${errors.map((e) => e.toString()).join('\n')}`,
    );
  }

  return validated;
}

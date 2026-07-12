# Прод-образ NestJS API. Контекст сборки — корень монорепозитория:
#   docker build -f apps/api/Dockerfile -t portfolio-api .
# Многостадийная сборка: устанавливаем зависимости и собираем в build-стадии,
# в runtime переносим готовый workspace (pnpm использует символические ссылки,
# поэтому переносим каталог целиком).

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# ---- build ----
FROM base AS build

# Сначала только манифесты — для кэширования слоя установки зависимостей.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/contract/package.json packages/contract/
COPY packages/ui-kit/package.json packages/ui-kit/

# Ставим зависимости только для api и contract (web в прод-образ не входит).
RUN pnpm install --frozen-lockfile --filter "@portfolio/api..." --filter "@portfolio/contract..."

# Исходники и сборка: контракт → prisma client → nest build.
COPY apps/api apps/api
COPY packages/contract packages/contract
RUN pnpm --filter @portfolio/contract build \
  && pnpm --filter @portfolio/api prisma:generate \
  && pnpm --filter @portfolio/api build

# ---- runtime ----
FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000
# Загруженные файлы — на отдельном томе, чтобы переживали пересборку образа.
ENV UPLOAD_DIR=/data/uploads

# Переносим собранный workspace целиком (сохраняя pnpm-симлинки и сгенерированный
# prisma client). prisma CLI остаётся доступен для `migrate deploy` на старте.
COPY --from=build /app /app
WORKDIR /app/apps/api

RUN mkdir -p /data/uploads
EXPOSE 3000

# На старте применяем миграции, затем поднимаем API.
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main"]

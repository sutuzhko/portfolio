# Прод-образ фронтенда: сборка SPA + раздача через Caddy (он же реверс-прокси на API).
# Контекст сборки — корень монорепозитория:
#   docker build -f apps/web/Dockerfile -t portfolio-web .

FROM node:22-bookworm-slim AS build
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# Манифесты ВСЕХ воркспейс-пакетов — pnpm строит граф по всему воркспейсу, а
# --frozen-lockfile требует их наличия (иначе ошибка про отсутствующий package.json).
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/contract/package.json packages/contract/
COPY packages/ui-kit/package.json packages/ui-kit/

# Ставим web и его воркспейс-зависимости (contract + ui-kit разрешаются из src).
RUN pnpm install --frozen-lockfile --filter "@portfolio/web..."

# Исходники и сборка. Моки (MSW) в прод-бандл не попадают (VITE_ENABLE_MOCKS не задан).
COPY apps/web apps/web
COPY packages/contract packages/contract
COPY packages/ui-kit packages/ui-kit
RUN pnpm --filter @portfolio/web build

# ---- runtime: Caddy раздаёт статику и проксирует API ----
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/web/dist /srv

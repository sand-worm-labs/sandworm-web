# syntax=docker/dockerfile:1.7
#
# One image recipe for every Node app in the monorepo: api, web, terminal,
# landing-page and mcp. Build it from the repo root and pick the app with
# build args:
#
#   docker build -f deployment/coolify/docker/node.Dockerfile \
#     --build-arg APP=@sandworm/web --build-arg APP_DIR=apps/web -t sandworm-web .
#
# The compose file (deployment/coolify/stack) sets each service's working
# directory and start command. NEXT_PUBLIC_* and PUBLIC_* values are baked in
# at build time, so web, terminal and landing images are built per environment.

ARG NODE_VERSION=22.12.0

FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1 \
    TURBO_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /repo

# 1. Cut the repo down to the app and the workspace packages it depends on.
FROM base AS prune
ARG APP
COPY . .
RUN test -n "${APP}" || (echo "Set --build-arg APP=<package name>" && exit 1)
RUN pnpm dlx turbo@2.9.18 prune "${APP}" --docker

# 2. Install from the package.json files alone, so a code change reuses this layer.
FROM base AS install
COPY --from=prune /repo/out/json/ ./
COPY --from=prune /repo/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prune /repo/.npmrc ./.npmrc
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# 3. Build the app and every workspace package under it.
FROM install AS build
ARG APP
ARG APP_DIR
# Public, build-time values. Leave unused ones empty: only the ones with a value
# are written to the app's .env.production, so an app's own defaults still apply.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_WS_URL
ARG NEXT_PUBLIC_PUBLIC_URL
ARG NEXT_PUBLIC_REDIRECT_URI
ARG NEXT_PUBLIC_LANDING_URL
ARG NEXT_PUBLIC_YJS_WS_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GITHUB_CLIENT_ID
ARG NEXT_PUBLIC_TERMINAL_URL
ARG NEXT_PUBLIC_WEB_APP_URL
ARG PUBLIC_APP_URL
COPY --from=prune /repo/out/full/ ./
RUN test -n "${APP_DIR}" || (echo "Set --build-arg APP_DIR=apps/<dir>" && exit 1); \
    env | grep -E '^(NEXT_PUBLIC_|PUBLIC_)[A-Z0-9_]*=.' > "${APP_DIR}/.env.production" || true
# The web build needs a large heap (scripts/start-prod.sh used the same 6 GB).
RUN NODE_OPTIONS=--max-old-space-size=6144 pnpm exec turbo run build --filter="${APP}" --env-mode=loose

# 4. Run. Keeps the full install: migrations run TypeScript through ts-node,
# which is a dev dependency. Slimming the image (Next standalone, prod-only
# installs) can come once staging is stable.
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build --chown=node:node /repo /repo
USER node

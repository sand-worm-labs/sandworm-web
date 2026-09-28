#!/usr/bin/env bash
# Rebuild and restart individual apps without redoing the full start-prod.sh.
#
# Usage: scripts/rebuild.sh [web|api|landing|editor|mcp|all]...
#   e.g. scripts/rebuild.sh api web
set -e
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ "$#" -eq 0 ]; then
  echo "Usage: $0 [web|api|landing|editor|mcp|all]..."
  exit 1
fi

TARGETS=("$@")
if [[ " ${TARGETS[*]} " == *" all "* ]]; then
  TARGETS=(editor api web landing mcp)
fi

# A no-op if the lockfile hasn't changed, but cheap insurance against a
# package (new or existing) whose node_modules was never linked on this
# host — that fails as a confusing tsc error deep in the build, not here.
echo "▶ Installing dependencies..."
pnpm install --frozen-lockfile

# Uses turbo (not plain `pnpm --filter`) so workspace deps like @sandworm/types
# get built first per turbo.json's build.dependsOn = ["^build"].
for target in "${TARGETS[@]}"; do
  case "$target" in
    editor)
      echo "▶ Building editor package..."
      pnpm turbo run build --filter=@sandworm/editor
      ;;
    api)
      echo "▶ Building API..."
      pnpm turbo run build --filter=@sandworm/app_api
      ;;
    web)
      echo "▶ Building Next.js..."
      NODE_OPTIONS='--max-old-space-size=6144' pnpm turbo run build --filter=@sandworm/web
      ;;
    landing)
      echo "▶ Building landing page..."
      pnpm turbo run build --filter=@sandworm/landing-page
      ;;
    mcp)
      echo "▶ Building MCP server..."
      pnpm turbo run build --filter=@sandworm/mcp
      ;;
    *)
      echo "Unknown target: $target (expected web|api|landing|editor|mcp|all)"
      exit 1
      ;;
  esac
done

# ─── RESTART ─────────────────────────────────────────────────────────────────
# The editor package is bundled into api/web, so it has no process of its own.
if command -v pm2 > /dev/null 2>&1 && pm2 describe web > /dev/null 2>&1; then
  # Regenerate from $ROOT_DIR rather than trusting the committed
  # ecosystem.config.js — it can carry another machine's absolute paths (e.g.
  # checked in from a dev's laptop) and go stale when an app is added.
  echo "▶ Writing PM2 ecosystem config..."
  cat > "$ROOT_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [
    {
      name: 'api',
      script: '$ROOT_DIR/apps/api/dist/main.js',
      cwd: '$ROOT_DIR/apps/api',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '1G',
      restart_delay: 3000,
    },
    {
      name: 'web',
      script: 'pnpm',
      args: 'run start',
      interpreter: 'none',
      cwd: '$ROOT_DIR/apps/web',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '1500M',
      restart_delay: 3000,
    },
    {
      name: 'landing',
      script: 'pnpm',
      args: 'run preview --host 0.0.0.0',
      interpreter: 'none',
      cwd: '$ROOT_DIR/apps/landing-page',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '512M',
      restart_delay: 3000,
    },
    {
      name: 'ai',
      script: 'docker',
      args: 'compose up --build',
      interpreter: 'none',
      cwd: '$ROOT_DIR/apps/ai',
      restart_delay: 5000,
    },
    {
      // Unlike api (NestJS's own ConfigModule reads .env), mcp only gets its
      // env vars from node's --env-file flag in its own 'start' script — so
      // it has to run through pnpm, not dist/index.js directly.
      name: 'mcp',
      script: 'pnpm',
      args: 'run start',
      interpreter: 'none',
      cwd: '$ROOT_DIR/apps/mcp',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '512M',
      restart_delay: 3000,
    },
  ],
};
EOF

  for target in "${TARGETS[@]}"; do
    [ "$target" = "editor" ] && continue
    if pm2 describe "$target" > /dev/null 2>&1; then
      echo "▶ Restarting $target..."
      pm2 restart "$target"
    else
      # pm2 doesn't have this app yet (e.g. it's new) — start just that one
      # entry from the ecosystem file instead of failing.
      echo "▶ Starting $target (not previously running)..."
      pm2 start "$ROOT_DIR/ecosystem.config.js" --only "$target"
    fi
  done
  pm2 save
else
  echo "ℹ pm2 isn't managing these apps here — restart them yourself."
fi

echo "✅ Rebuilt: ${TARGETS[*]}"

#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

ENV="${1:-}"

case "$ENV" in
  staging|prod) ;;
  *)
    echo "Usage: $0 [staging|prod]"
    exit 1
    ;;
esac

if [ "$ENV" = "staging" ]; then
  COMPOSE_BASE="$ROOT_DIR/deployment/docker/docker-compose.staging.yml"
else
  COMPOSE_BASE="$ROOT_DIR/deployment/docker/docker-compose.yml"
fi

# ─── ENV SETUP ───────────────────────────────────────────────────────────────
echo "▶ Running env setup..."
chmod +x "$ROOT_DIR/scripts/setup-envs.sh"
"$ROOT_DIR/scripts/setup-envs.sh"

echo "▶ Setting $ENV domain envs..."
chmod +x "$ROOT_DIR/scripts/setup-domain-envs.sh"
"$ROOT_DIR/scripts/setup-domain-envs.sh" "$ENV"

# ─── ARCH DETECTION ──────────────────────────────────────────────────────────
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
  COMPOSE_OVERRIDE="docker-compose.mac.yml"
else
  COMPOSE_OVERRIDE="docker-compose.linux.yml"
fi

# ─── JUPYTER TOKEN ───────────────────────────────────────────────────────────
export JUPYTER_TOKEN=$(grep JUPYTER_TOKEN "$ROOT_DIR/apps/api/.env" | cut -d '=' -f2 | tr -d "'" | tr -d '"')

# ─── DOCKER SERVICES ─────────────────────────────────────────────────────────
echo "▶ Starting Docker services..."
docker compose \
  -f "$COMPOSE_BASE" \
  -f "$ROOT_DIR/deployment/docker/$COMPOSE_OVERRIDE" \
  up -d --build --remove-orphans

# ─── WAIT FOR POSTGRES ───────────────────────────────────────────────────────
echo "▶ Waiting for Postgres..."
until docker exec sandworm-postgres pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1
done
echo "Postgres is ready ✅"

# ─── INSTALL DEPS ────────────────────────────────────────────────────────────
echo "▶ Installing dependencies..."
cd "$ROOT_DIR"
pnpm install --frozen-lockfile

# ─── BUILD ───────────────────────────────────────────────────────────────────
echo "▶ Building editor package..."
pnpm --filter @sandworm/editor build

echo "▶ Building API..."
pnpm --filter api build

echo "▶ Building Next.js..."
NODE_OPTIONS='--max-old-space-size=4096' pnpm --filter web build

echo "▶ Building landing page..."
pnpm --filter landing-page build

# ─── PM2 ─────────────────────────────────────────────────────────────────────
echo "▶ Ensuring PM2 is installed..."
if ! command -v pm2 > /dev/null 2>&1; then
  sudo npm install -g pm2
fi

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
  ],
};
EOF

echo "▶ Starting apps with PM2..."
pm2 delete all 2>/dev/null || true
pm2 start "$ROOT_DIR/ecosystem.config.js"
pm2 save
pm2 startup || true

echo
echo "✅ $ENV deployment complete!"
echo "   pm2 list        — process status"
echo "   pm2 logs        — tail all logs"
echo "   pm2 restart all — restart everything"

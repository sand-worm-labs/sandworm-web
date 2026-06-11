#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# ─── PM2 ─────────────────────────────────────────────────────────────────────
echo "▶ Stopping PM2 apps..."
pm2 delete all 2>/dev/null || true

# ─── DOCKER SERVICES ─────────────────────────────────────────────────────────
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
  COMPOSE_OVERRIDE="docker-compose.mac.yml"
else
  COMPOSE_OVERRIDE="docker-compose.linux.yml"
fi

COMPOSE_BASE="$ROOT_DIR/deployment/docker/docker-compose.dev.yml"
COMPOSE_ARCH="$ROOT_DIR/deployment/docker/$COMPOSE_OVERRIDE"

echo "▶ Stopping Docker services..."
docker compose \
  -f "$COMPOSE_BASE" \
  -f "$COMPOSE_ARCH" \
  down

echo
echo "✅ Production environment stopped."

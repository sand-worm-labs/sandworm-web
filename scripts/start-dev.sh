#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "▶ Running env setup..."
chmod +x "$ROOT_DIR/scripts/setup-envs.sh"
"$ROOT_DIR/scripts/setup-envs.sh"

# ─── ARCH DETECTION ──────────────────────────────────────────────────────────

ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
    TARGETARCH="arm64"
    COMPOSE_OVERRIDE="docker-compose.mac.yml"
    echo "▶ Detected ARM64 (Apple Silicon / ARM)"
else
    TARGETARCH="amd64"
    COMPOSE_OVERRIDE="docker-compose.linux.yml"
    echo "▶ Detected AMD64 (Linux / ThinkPad)"
fi

export TARGETARCH

# ─── JUPYTER TOKEN ───────────────────────────────────────────────────────────

export JUPYTER_TOKEN=$(grep JUPYTER_TOKEN "$ROOT_DIR/apps/api/.env" | cut -d '=' -f2 | tr -d "'" | tr -d '"')
echo "Using JUPYTER_TOKEN=$JUPYTER_TOKEN"

echo
echo "▶ Cleaning Docker volumes if they exist..."
VOLUMES=("docker_sandworm-postgres-data" "docker_sandworm-pgadmin-data" "docker_sandworm-jupyter-notebooks")
for VOLUME in "${VOLUMES[@]}"; do
    CONTAINERS=$(docker ps -a --filter "volume=$VOLUME" --format "{{.ID}}")
    if [ -n "$CONTAINERS" ]; then
        echo "Stopping containers using volume $VOLUME..."
        docker rm -f $CONTAINERS
    fi
    if docker volume inspect "$VOLUME" > /dev/null 2>&1; then
        echo "Removing volume: $VOLUME"
        docker volume rm "$VOLUME"
    fi
done

echo
echo "▶ Starting Docker services..."

if command -v docker compose > /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

COMPOSE_BASE="$ROOT_DIR/deployment/docker/docker-compose.dev.yml"
COMPOSE_ARCH="$ROOT_DIR/deployment/docker/$COMPOSE_OVERRIDE"

JUPYTER_TOKEN=$JUPYTER_TOKEN TARGETARCH=$TARGETARCH \
    $COMPOSE_CMD \
    -f "$COMPOSE_BASE" \
    -f "$COMPOSE_ARCH" \
    up -d --build --remove-orphans

echo
echo "▶ Checking node_modules..."
if [ ! -d "$ROOT_DIR/node_modules" ]; then
    echo "node_modules not found, running pnpm install..."
    pnpm install
else
    echo "node_modules already present, skipping pnpm install"
fi

echo
echo "▶ Waiting for Postgres..."
until docker exec sandworm-postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "Postgres not ready yet..."
    sleep 1
done
echo "Postgres is ready ✅"

echo
echo "▶ Running database migrations..."
cd "$ROOT_DIR/packages/postgresql-typeorm"
pnpm run migration:up

echo
echo "▶ Seeding database..."
pnpm run seed:run

echo
echo "▶ Starting dev server..."
cd "$ROOT_DIR"
pnpm run dev

echo
echo "▶ Development environment is ready!"
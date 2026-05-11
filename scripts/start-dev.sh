#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# ═════════════════════════════════════════════════════════════════════════════
# ⬢ ARG PARSING
# ═════════════════════════════════════════════════════════════════════════════
CLEAN_VOLUMES=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --clean-volumes|--nuke)
      CLEAN_VOLUMES=true
      shift
      ;;
    *)
      echo "Unknown flag: $1"
      echo "Usage: $0 [--clean-volumes]"
      exit 1
      ;;
  esac
done

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

# ═════════════════════════════════════════════════════════════════════════════
# ⬢ VOLUME CLEANUP (CONDITIONAL)
# ═════════════════════════════════════════════════════════════════════════════
if [ "$CLEAN_VOLUMES" = true ]; then
  echo "▶ Cleaning Docker volumes (--clean-volumes flag detected)..."
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
else
  echo "▶ Skipping volume cleanup (use --clean-volumes to force)"
fi
echo

# ─── REST OF SCRIPT CONTINUES UNCHANGED ───────────────────────────────────────
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

if [ "$CLEAN_VOLUMES" = true ]; then
    echo
    echo "▶ Running database migrations..."
    cd "$ROOT_DIR/packages/postgresql-typeorm"
    pnpm run migration:up

    echo
    echo "▶ Seeding database..."
    pnpm run seed:run
fi

echo
echo "▶ Starting AI service in background..."
(
  cd "$ROOT_DIR/apps/ai"
  poetry env use python3.12
  poetry install --quiet
  just dev
) &
AI_PID=$!

echo
echo "▶ Waiting for AI service..."
until curl -s http://localhost:8000/health > /dev/null 2>&1; do
    echo "AI service not ready yet..."
    sleep 1
done
echo "AI service is ready ✅"

echo
echo "▶ Starting dev server..."
cd "$ROOT_DIR"
pnpm run dev

wait $AI_PID



echo
echo "▶ Development environment is ready!"
#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# ═════════════════════════════════════════════════════════════════════════════
# ⬢ ARG PARSING
# ═════════════════════════════════════════════════════════════════════════════
CLEAN_VOLUMES=false
TARGET=full
ONLY=false

usage() {
  cat <<USAGE
Usage: $0 [target] [--only] [--clean-volumes]

Each target also starts what it depends on:

  --full       everything (default): Docker services, API, web, landing, terminal, ...
  --web        Postgres, Redis, Caddy, API, web
  --terminal   --web + terminal      (sign-in goes through the web app)
  --landing    --web + landing       (it links into the web app)

Modifiers:
  --only           skip the dependencies and run just the target app
                   (terminal: use http://localhost:3002/dev/preview?access=allowed)
  --clean-volumes  (alias --nuke) wipe the Docker volumes first (--full only)
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --full|--web|--landing|--terminal) TARGET="${1#--}"; shift ;;
    --only) ONLY=true; shift ;;
    --clean-volumes|--nuke) CLEAN_VOLUMES=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown flag: $1"; usage; exit 1 ;;
  esac
done

# ─── LIGHT TARGETS ───────────────────────────────────────────────────────────
# turbo runs the target app, the apps it needs and their workspace packages
# ("..." means the app plus everything it depends on).
start_services() {
  echo "▶ Running env setup..."
  chmod +x "$ROOT_DIR/scripts/setup-envs.sh" "$ROOT_DIR/scripts/setup-domain-envs.sh"
  "$ROOT_DIR/scripts/setup-envs.sh"
  "$ROOT_DIR/scripts/setup-domain-envs.sh" dev

  # Compose reads every service in the file, so Jupyter's variables are needed
  # even though Jupyter is not started here.
  JUPYTER_TOKEN=$(grep JUPYTER_TOKEN "$ROOT_DIR/apps/api/.env" | cut -d '=' -f2 | tr -d "'" | tr -d '"')
  export JUPYTER_TOKEN
  case "$(uname -m)" in arm64|aarch64) export TARGETARCH=arm64 ;; *) export TARGETARCH=amd64 ;; esac

  echo "▶ Starting Postgres, Redis and Caddy..."
  docker compose -f "$ROOT_DIR/deployment/docker/docker-compose.dev.yml" up -d db redis caddy
  # Caddy keeps the Caddyfile it started with, so pick up edits.
  docker restart sandworm-proxy > /dev/null
  until docker exec sandworm-postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "Postgres not ready yet..."
    sleep 1
  done

  # migration:up runs "clean" (rm -rf dist) first, so build the package after it.
  (cd "$ROOT_DIR/packages/postgresql-typeorm" && pnpm run migration:up)
  pnpm --dir "$ROOT_DIR" exec turbo build --filter=@sandworm/postgresql-typeorm
}

if [ "$TARGET" != "full" ]; then
  [ -d "$ROOT_DIR/node_modules" ] || (cd "$ROOT_DIR" && pnpm install)

  case "$TARGET" in
    web) APPS=(@sandworm/web) ;;
    landing) APPS=(@sandworm/landing-page @sandworm/web) ;;
    terminal)
      [ -f "$ROOT_DIR/apps/terminal/.env" ] || cp "$ROOT_DIR/apps/terminal/.env.example" "$ROOT_DIR/apps/terminal/.env"
      APPS=(@sandworm/terminal @sandworm/web)
      ;;
  esac

  if [ "$ONLY" = true ]; then
    FILTERS=(--filter="${APPS[0]}")
  else
    start_services
    FILTERS=(--filter=@sandworm/app_api...)
    for app in "${APPS[@]}"; do FILTERS+=(--filter="$app..."); done
  fi

  echo "▶ turbo dev ${FILTERS[*]}"
  cd "$ROOT_DIR"
  exec pnpm exec turbo dev "${FILTERS[@]}"
fi

echo "▶ Running env setup..."
chmod +x "$ROOT_DIR/scripts/setup-envs.sh"
"$ROOT_DIR/scripts/setup-envs.sh"

echo "▶ Setting dev domain envs..."
chmod +x "$ROOT_DIR/scripts/setup-domain-envs.sh"
"$ROOT_DIR/scripts/setup-domain-envs.sh" dev

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

pnpm --filter @sandworm/editor build

echo
echo "▶ Starting dev server..."
cd "$ROOT_DIR"
pnpm run dev

echo
echo "▶ Development environment is ready!"
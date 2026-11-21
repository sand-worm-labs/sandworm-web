#!/usr/bin/env bash
# Runs the Coolify stack on this machine, to test it before staging and production:
# the real images (built here with the CI Dockerfiles), the real stack/docker-compose.yml,
# and a local Traefik in place of Coolify's (compose.yml). Hosts are app.localhost,
# mcp.localhost and localhost.
#
#   test.sh                   build the images, start the stack, check it answers
#   test.sh --no-build        the same with the images already built
#   test.sh --restore FILE    load FILE (pg_dump -Fc of the old database) into the stack's
#                             Postgres first, so migrate runs on real data: the
#                             production cutover, rehearsed
#   test.sh --env production  production's settings and hostnames instead of localhost's;
#                             point them at 127.0.0.1 in /etc/hosts first
#   test.sh down              stop it and delete its volumes
#
# Settings come from `deploy.sh envs local --write`, so from your sandworm-*.env files.
# Terminal (its own repo now) and ai are not started.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
STACK="$ROOT_DIR/deployment/coolify/stack"
SERVICES=(postgres redis qdrant jupyter migrate api web mcp landing down traefik)

compose() { docker compose -p sandworm-local -f "$STACK/docker-compose.yml" -f "$ROOT_DIR/deployment/coolify/local/compose.yml" "$@"; }
log() { printf '\033[1m▶ %s\033[0m\n' "$*"; }

if [ "${1:-}" = down ]; then compose down -v --remove-orphans; exit; fi

build=true restore="" env=local
while [ $# -gt 0 ]; do
  case "$1" in
    --no-build) build=false; shift ;;
    --env) env="$2"; shift 2 ;;
    --restore) restore="$(realpath "$2")"; shift 2 ;;
    *) sed -n '2,18p' "$0"; exit 2 ;;
  esac
done

log "Settings"
"$ROOT_DIR/deployment/coolify/deploy.sh" envs "$env" --write > /dev/null
# Coolify writes the stack's .env itself; here it is the file deploy.sh made. Git-ignored.
cp "$ROOT_DIR/sandworm-stack-$env.env" "$STACK/.env"
env_value() { sed -n "s/^$1=//p" "$STACK/.env"; }

if [ "$build" = true ]; then
  build_args=()
  while IFS= read -r line; do
    [[ "$line" =~ ^[A-Z] ]] && build_args+=(--build-arg "$line")
  done < "$ROOT_DIR/sandworm-stack-$env.build.env"
  # The same images, apps and Dockerfiles as .github/workflows/images.yml.
  for app in "api @sandworm/app_api apps/api" "web @sandworm/web apps/web" \
             "landing @sandworm/landing-page apps/landing-page" "mcp @sandworm/mcp apps/mcp"; do
    read -r name pkg dir <<< "$app"
    log "Building $name"
    docker build -q -f "$ROOT_DIR/deployment/coolify/docker/node.Dockerfile" \
      --build-arg APP="$pkg" --build-arg APP_DIR="$dir" "${build_args[@]}" \
      -t "ghcr.io/sand-worm-labs/sandworm-$name:$env" "$ROOT_DIR"
  done
  log "Building jupyter"
  docker build -q -t "ghcr.io/sand-worm-labs/sandworm-jupyter:$env" "$ROOT_DIR/apps/jupyter"
fi

# The stack joins the monitoring stack's network, which Coolify has and this machine may not.
docker network inspect monitoring > /dev/null 2>&1 || docker network create monitoring > /dev/null

if [ -n "$restore" ]; then
  log "Restoring $(basename "$restore")"
  compose up -d --wait postgres
  compose exec -T postgres pg_restore --clean --if-exists --no-owner \
    -U "$(env_value DATABASE_USERNAME)" -d "$(env_value DATABASE_NAME)" < "$restore" \
    || echo "pg_restore reported errors (see above); carrying on, as the cutover would"
fi

log "Starting the stack"
compose up -d "${SERVICES[@]}"

log "Waiting for the api"
for _ in $(seq 1 60); do
  [ "$(docker inspect -f '{{.State.Health.Status}}' sandworm-local-api-1 2>/dev/null)" = healthy ] && break
  if [ "$(docker inspect -f '{{.State.Status}} {{.State.ExitCode}}' sandworm-local-migrate-1 2>/dev/null)" = "exited 1" ]; then
    compose logs migrate | tail -30; echo "migrate failed"; exit 1
  fi
  sleep 5
done

log "Checking routes"
failed=0
check() {
  local name="$1" url="$2"; shift 2
  local code
  code="$(curl -ks -o /dev/null -w '%{http_code}' "$@" "$url")"
  if [[ "$code" =~ ^[23] ]]; then echo "  ok    $code  $name"; else echo "  FAIL  $code  $name ($url)"; failed=1; fi
}
app="$(env_value APP_HOST)"
check "web"                "https://$app/"
check "api (graphql)"      "https://$app/api/graphql" -X POST -H 'content-type: application/json' -d '{"query":"{__typename}"}'
check "oauth discovery"    "https://$app/.well-known/oauth-authorization-server"
check "mcp"                "https://$(env_value MCP_HOST)/.well-known/oauth-protected-resource"
check "landing"            "https://$(env_value LANDING_HOST)/"
check "http → https"       "http://$app/"

if [ "$failed" = 0 ]; then
  echo; echo "✅ The stack answers. Open https://$app (accept the self-signed certificate)."
else
  echo; echo "Some routes failed: compose logs with"
  echo "  docker compose -p sandworm-local logs <service>"
  exit 1
fi

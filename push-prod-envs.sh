#!/usr/bin/env bash
# Sends the production env files (the root sandworm-*.env) to the server, each one to the
# .env of the app it belongs to. Unlike push-envs.sh, it never sends your local .env files.
#
# Usage: ./push-prod-envs.sh [--apply] <user@host:/path/to/repo>
#   e.g. ./push-prod-envs.sh --apply root@64.20.61.218:/root/sandworm-web
#
# It only shows what it would send until you pass --apply. A file already on the server
# is kept next to the new one as .env.bak-<time>.
set -euo pipefail

cd "$(cd "$(dirname "$0")" && pwd)"

# Production file : where it goes inside the repo on the server
FILES=(
  "sandworm-api.env:apps/api/.env"
  "sandworm-web.env:apps/web/.env"
  "sandworm-mcp.env:apps/mcp/.env"
  "sandworm-landing.env:apps/landing-page/.env"
  "sandworm-ai.env:apps/ai/.env"
  "sandworm-postgres.env:packages/postgresql-typeorm/.env"
)

APPLY=false
TARGET="${PUSH_ENVS_TARGET:-}"
for arg in "$@"; do
  case "$arg" in
    --apply) APPLY=true ;;
    -h|--help) sed -n '2,9p' "$0"; exit 0 ;;
    *) TARGET="$arg" ;;
  esac
done

[[ "$TARGET" == *:* ]] || { echo "Give the target: user@host:/path/to/repo" >&2; exit 1; }
HOST="${TARGET%%:*}"
DIR="${TARGET#*:}"
STAMP="$(date +%Y%m%d-%H%M%S)"

for pair in "${FILES[@]}"; do
  src="${pair%%:*}"
  dest="${pair#*:}"
  if [ ! -f "$src" ]; then
    echo "  skip  $src (not here)"
    continue
  fi
  # A localhost address in a production file is right only for services on the same machine.
  if grep -qE '^[A-Za-z_]+=.*(PUBLIC|DOMAIN|CORS|REDIRECT)' "$src" && grep -E '^[A-Za-z_]*(PUBLIC|DOMAIN|CORS|REDIRECT)[A-Za-z_]*=.*localhost' "$src" > /dev/null; then
    echo "  STOP  $src has a public address set to localhost" >&2
    exit 1
  fi
  if $APPLY; then
    ssh "$HOST" "cd '$DIR' && mkdir -p '$(dirname "$dest")' && { [ ! -f '$dest' ] || cp -p '$dest' '$dest.bak-$STAMP'; }"
    scp -q "$src" "$HOST:$DIR/$dest"
    ssh "$HOST" "chmod 600 '$DIR/$dest'"
    echo "  sent  $src -> $dest"
  else
    echo "  would send  $src -> $dest"
  fi
done

$APPLY || { echo; echo "Dry run. Pass --apply to send."; exit 0; }

cat <<'NOTE'

Done. On the server:

  scripts/rebuild.sh api web mcp
NOTE

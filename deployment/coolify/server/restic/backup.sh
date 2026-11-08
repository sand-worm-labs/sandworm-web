#!/usr/bin/env bash
# Nightly encrypted offsite backup of a Sandworm Coolify server, with restic.
#
# Backs up:
#   - the stack's Postgres, as a pg_dump (consistent, unlike copying the volume)
#   - Qdrant, as a full storage snapshot taken through its API
#   - the Jupyter work volume
#   - Coolify itself: /data/coolify and a dump of its own database
#
# Settings come from /etc/sandworm/restic.env (see restic.env.example). Run by
# sandworm-backup.timer; run it by hand to test. Needs root (Docker, volumes).
set -euo pipefail

ENV_FILE="${RESTIC_ENV_FILE:-/etc/sandworm/restic.env}"
[ -r "$ENV_FILE" ] || { echo "Missing $ENV_FILE" >&2; exit 1; }
set -a; . "$ENV_FILE"; set +a

: "${RESTIC_REPOSITORY:?set in $ENV_FILE}"
KEEP_DAILY="${KEEP_DAILY:-7}"
KEEP_WEEKLY="${KEEP_WEEKLY:-4}"
KEEP_MONTHLY="${KEEP_MONTHLY:-6}"

log() { echo "[$(date -u +%FT%TZ)] $*"; }

# The one running container of a compose service. Coolify adds a suffix to
# container names, so look containers up by their compose service label.
container_of() {
  local service="$1" names count
  names="$(docker ps --filter "label=com.docker.compose.service=$service" --format '{{.Names}}')"
  count="$(printf '%s' "$names" | grep -c . || true)"
  if [ "$count" -ne 1 ]; then
    echo "Expected one running '$service' container, found $count: $names" >&2
    return 1
  fi
  printf '%s' "$names"
}

# A named volume's directory on the host. Coolify prefixes volume names, so
# match on the compose volume label, then on the name's suffix.
volume_path() {
  local volume="$1" names
  names="$(docker volume ls -q --filter "label=com.docker.compose.volume=$volume")"
  [ -n "$names" ] || names="$(docker volume ls -q | grep -E "(^|[_-])${volume}\$" || true)"
  if [ "$(printf '%s' "$names" | grep -c . || true)" -ne 1 ]; then
    echo "Expected one '$volume' volume, found: ${names:-none}" >&2
    return 1
  fi
  docker volume inspect -f '{{.Mountpoint}}' "$names"
}

# A fixed path: restic groups snapshots by path, and retention works per group.
WORK=/var/lib/sandworm-backup/dumps
rm -rf "$WORK"; mkdir -p "$WORK"; chmod 700 /var/lib/sandworm-backup
trap 'rm -rf "$WORK"' EXIT

restic cat config >/dev/null 2>&1 || { log "Initialising the repository"; restic init; }

log "Postgres"
PG="$(container_of postgres)"
docker exec "$PG" sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$WORK/postgres.dump"

log "Coolify's database"
if docker ps --format '{{.Names}}' | grep -qx coolify-db; then
  docker exec coolify-db pg_dump -U coolify -d coolify -Fc > "$WORK/coolify-db.dump"
fi

log "Qdrant"
QD="$(container_of qdrant)"
QD_KEY="$(docker exec "$QD" printenv QDRANT__SERVICE__API_KEY || true)"
qdrant_api() {
  # Qdrant's image has no curl: borrow one that shares the container's network.
  docker run --rm --network "container:$QD" curlimages/curl:8.10.1 -fsS -H "api-key: $QD_KEY" "$@"
}
SNAPSHOT="$(qdrant_api -X POST http://localhost:6333/snapshots | jq -r '.result.name')"
docker cp "$QD:/qdrant/snapshots/$SNAPSHOT" "$WORK/qdrant.snapshot"
qdrant_api -X DELETE "http://localhost:6333/snapshots/$SNAPSHOT" >/dev/null

log "Upload"
PATHS=("$WORK" /data/coolify)
if JUPYTER_PATH="$(volume_path jupyter-work)"; then
  PATHS+=("$JUPYTER_PATH")
else
  log "WARNING: no Jupyter volume found, backing up without it"
fi
restic backup --tag sandworm "${PATHS[@]}"

log "Retention"
restic forget --tag sandworm --group-by host,tags --prune \
  --keep-daily "$KEEP_DAILY" --keep-weekly "$KEEP_WEEKLY" --keep-monthly "$KEEP_MONTHLY"

# A weekly read of part of the data catches a damaged repository early.
if [ "$(date -u +%u)" = 7 ]; then
  log "Checking the repository"
  restic check --read-data-subset=5%
fi

# Tell Uptime Kuma the backup ran (a Push monitor), so a missed night alerts.
if [ -n "${BACKUP_PING_URL:-}" ]; then
  curl -fsS -m 10 "$BACKUP_PING_URL" >/dev/null || log "Could not ping $BACKUP_PING_URL"
fi

log "Backup done"

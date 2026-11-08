#!/usr/bin/env bash
# Restores a Sandworm backup made by backup.sh.
#
# Usage (as root):
#   ./restore.sh list
#       Lists the snapshots.
#   ./restore.sh files <dir> [snapshot]
#       Restores a snapshot (default: latest) into <dir>. Touches nothing live.
#   ./restore.sh postgres [snapshot] --yes
#       Loads the snapshot's Postgres dump into the running stack's database,
#       replacing what is there. Stop the api first, so nothing writes meanwhile.
#
# Qdrant and Jupyter come back with `files`: see ../../README.md, "Restore".
set -euo pipefail

ENV_FILE="${RESTIC_ENV_FILE:-/etc/sandworm/restic.env}"
[ -r "$ENV_FILE" ] || { echo "Missing $ENV_FILE" >&2; exit 1; }
set -a; . "$ENV_FILE"; set +a

cmd="${1:-}"; shift || true

container_of() {
  local names
  names="$(docker ps --filter "label=com.docker.compose.service=$1" --format '{{.Names}}')"
  [ "$(printf '%s' "$names" | grep -c . || true)" -eq 1 ] || { echo "Expected one running '$1' container, found: ${names:-none}" >&2; return 1; }
  printf '%s' "$names"
}

case "$cmd" in
  list)
    restic snapshots --tag sandworm
    ;;

  files)
    dir="${1:?give a directory to restore into}"
    snapshot="${2:-latest}"
    mkdir -p "$dir"
    restic restore "$snapshot" --tag sandworm --target "$dir"
    echo "Restored into $dir. The dumps are under $dir/var/lib/sandworm-backup/dumps/"
    ;;

  postgres)
    snapshot="latest"
    yes=false
    for arg in "$@"; do
      case "$arg" in
        --yes) yes=true ;;
        *) snapshot="$arg" ;;
      esac
    done
    [ "$yes" = true ] || { echo "This replaces the live database. Add --yes to go ahead." >&2; exit 1; }

    work="$(mktemp -d /var/tmp/sandworm-restore.XXXXXX)"
    trap 'rm -rf "$work"' EXIT
    restic restore "$snapshot" --tag sandworm --target "$work" --include /var/lib/sandworm-backup/dumps/postgres.dump
    dump="$(find "$work" -name postgres.dump | head -n1)"
    [ -s "$dump" ] || { echo "No postgres.dump in snapshot $snapshot" >&2; exit 1; }

    pg="$(container_of postgres)"
    docker cp "$dump" "$pg:/tmp/restore.dump"
    docker exec "$pg" sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner /tmp/restore.dump; rm -f /tmp/restore.dump'
    echo "Postgres restored from $snapshot. Start the api again."
    ;;

  *)
    sed -n '2,13p' "$0"
    exit 2
    ;;
esac

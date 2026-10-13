#!/usr/bin/env bash
# Copies every local .env file to the server, keeping each one at the same path inside the repo.
#
# Usage: ./push-envs.sh [--apply] [--list] <user@host:/path/to/repo>
#   e.g. ./push-envs.sh user@64.20.61.218:/srv/sandworm-web
#
# It only shows what it would send until you pass --apply. --list prints the files and stops
# (no server needed). The target can also come from PUSH_ENVS_TARGET.
#
# These files hold private keys and passwords. They go over SSH and nowhere else, are made
# readable by their owner only, and any file already on the server is kept as <name>.bak-<time>.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

APPLY=false
LIST=false
TARGET="${PUSH_ENVS_TARGET:-}"

for arg in "$@"; do
  case "$arg" in
    --apply) APPLY=true ;;
    --list) LIST=true ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) TARGET="$arg" ;;
  esac
done

# Every .env in the repo, plus the root sandworm-*.env files. Not the .env.example templates.
mapfile -t FILES < <(
  find . \( -path ./.git -o -name node_modules -o -name .next -o -name dist \) -prune -o \
    -type f \( -name '.env' -o -name '.env.local' -o -name '.env.production' -o -name 'sandworm-*.env' \) -print \
    | sed 's#^\./##' | sort
)

if [ "${#FILES[@]}" -eq 0 ]; then
  echo "No env files found."
  exit 1
fi

echo "Env files (${#FILES[@]}):"
for file in "${FILES[@]}"; do
  printf '  %-48s %s bytes\n' "$file" "$(wc -c < "$file")"
done
$LIST && exit 0

[ -n "$TARGET" ] || { echo "Give the target: user@host:/path/to/repo" >&2; exit 1; }
[[ "$TARGET" == *:* ]] || { echo "The target needs a path: user@host:/path/to/repo" >&2; exit 1; }
command -v rsync > /dev/null || { echo "rsync is not installed" >&2; exit 1; }

STAMP="$(date +%Y%m%d-%H%M%S)"
RSYNC=(rsync -avh --relative --chmod=F600 --backup "--suffix=.bak-$STAMP" -e ssh)
$APPLY || RSYNC+=(--dry-run)

echo
if $APPLY; then echo "Sending to $TARGET"; else echo "Dry run to $TARGET (pass --apply to send)"; fi
printf '%s\n' "${FILES[@]}" | "${RSYNC[@]}" --files-from=- ./ "$TARGET/"

cat <<'NOTE'

Done. These are your local files, so they hold localhost URLs and development settings.
On the server, set the domains and restart:

  scripts/setup-domain-envs.sh prod      # or staging
  scripts/rebuild.sh api web mcp

Run the database migration too if the code changed (see scripts/start-prod.sh).
NOTE

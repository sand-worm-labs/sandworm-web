#!/usr/bin/env bash
# Rebuild and restart individual apps without redoing the full start-prod.sh.
#
# Usage: scripts/rebuild.sh [web|api|landing|editor|all]...
#   e.g. scripts/rebuild.sh api web
set -e
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ "$#" -eq 0 ]; then
  echo "Usage: $0 [web|api|landing|editor|all]..."
  exit 1
fi

TARGETS=("$@")
if [[ " ${TARGETS[*]} " == *" all "* ]]; then
  TARGETS=(editor api web landing)
fi

# Uses turbo (not plain `pnpm --filter`) so workspace deps like @sandworm/types
# get built first per turbo.json's build.dependsOn = ["^build"].
for target in "${TARGETS[@]}"; do
  case "$target" in
    editor)
      echo "▶ Building editor package..."
      pnpm turbo run build --filter=@sandworm/editor
      ;;
    api)
      echo "▶ Building API..."
      pnpm turbo run build --filter=@sandworm/app_api
      ;;
    web)
      echo "▶ Building Next.js..."
      NODE_OPTIONS='--max-old-space-size=6144' pnpm turbo run build --filter=@sandworm/web
      ;;
    landing)
      echo "▶ Building landing page..."
      pnpm turbo run build --filter=@sandworm/landing-page
      ;;
    *)
      echo "Unknown target: $target (expected web|api|landing|editor|all)"
      exit 1
      ;;
  esac
done

# ─── RESTART ─────────────────────────────────────────────────────────────────
# The editor package is bundled into api/web, so it has no process of its own.
if command -v pm2 > /dev/null 2>&1 && pm2 describe web > /dev/null 2>&1; then
  for target in "${TARGETS[@]}"; do
    [ "$target" = "editor" ] && continue
    echo "▶ Restarting $target..."
    pm2 restart "$target"
  done
else
  echo "ℹ pm2 isn't managing these apps here — restart them yourself."
fi

echo "✅ Rebuilt: ${TARGETS[*]}"

#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

ENV="${1:-}"

usage() {
  echo "Usage: $0 [dev|staging|prod]"
  exit 1
}

[ -z "$ENV" ] && usage

case "$ENV" in
  dev)
    APP_DOMAIN="http://localhost:8081"
    LANDING_DOMAIN="http://localhost:8080"
    WS_SCHEME="ws"
    NODE_ENV="development"
    ;;
  staging)
    APP_DOMAIN="https://app.preview-c8829726.sandwormlab.xyz"
    LANDING_DOMAIN="https://preview-c8829726.sandwormlab.xyz"
    WS_SCHEME="wss"
    NODE_ENV="production"
    ;;
  prod)
    APP_DOMAIN="https://app.sandwormlab.xyz"
    LANDING_DOMAIN="https://sandwormlab.xyz"
    WS_SCHEME="wss"
    NODE_ENV="production"
    ;;
  *)
    usage
    ;;
esac

API_ENV="$ROOT_DIR/apps/api/.env"
WEB_ENV="$ROOT_DIR/apps/web/.env"
LANDING_ENV="$ROOT_DIR/apps/landing-page/.env"

set_env() {
  local file="$1" key="$2" value="$3"
  if grep -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

WS_DOMAIN="${APP_DOMAIN/https/$WS_SCHEME}"
WS_DOMAIN="${WS_DOMAIN/http/$WS_SCHEME}"

echo "▶ Updating API env ($ENV)..."
set_env "$API_ENV" NODE_ENV "$NODE_ENV"
set_env "$API_ENV" APP_URL "$APP_DOMAIN"
set_env "$API_ENV" APP_CORS_ORIGIN "$APP_DOMAIN"
set_env "$API_ENV" FRONTEND_DOMAIN "$APP_DOMAIN"
set_env "$API_ENV" BACKEND_DOMAIN "$APP_DOMAIN"
echo "✅ $API_ENV updated"

echo "▶ Updating Web env ($ENV)..."
set_env "$WEB_ENV" NODE_ENV "$NODE_ENV"
set_env "$WEB_ENV" NEXT_PUBLIC_PUBLIC_URL "$APP_DOMAIN"
set_env "$WEB_ENV" NEXT_PUBLIC_LANDING_URL "$LANDING_DOMAIN"
set_env "$WEB_ENV" REDIRECT_URI "$APP_DOMAIN/workspace/"
set_env "$WEB_ENV" NEXT_PUBLIC_API_URL "$APP_DOMAIN/api"
set_env "$WEB_ENV" NEXT_PUBLIC_API_WS_URL "$WS_DOMAIN"
set_env "$WEB_ENV" NEXT_PUBLIC_YJS_WS_URL "$WS_DOMAIN"
set_env "$WEB_ENV" INTERNAL_API_URL "http://localhost:8003"
echo "✅ $WEB_ENV updated"

echo "▶ Updating Landing env ($ENV)..."
set_env "$LANDING_ENV" PUBLIC_APP_URL "$APP_DOMAIN"
echo "✅ $LANDING_ENV updated"

echo
echo "✅ Envs set for $ENV"
echo "   App:     $APP_DOMAIN"
echo "   Landing: $LANDING_DOMAIN"

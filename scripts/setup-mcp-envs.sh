#!/usr/bin/env bash
# Fill in apps/mcp/.env and the matching MCP settings in apps/api/.env, so the
# two always agree. Safe to re-run: URLs and the port are set every time,
# secrets are only generated when missing.
#
# Usage: scripts/setup-mcp-envs.sh [dev|staging|prod]
set -e
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

ENV="${1:-}"
MCP_PORT=6789

case "$ENV" in
  dev)
    APP_DOMAIN="http://localhost:8081"
    MCP_DOMAIN="http://localhost:$MCP_PORT"
    ;;
  staging)
    APP_DOMAIN="https://app.preview-c8829726.sandwormlab.xyz"
    MCP_DOMAIN="https://mcp.preview-c8829726.sandwormlab.xyz"
    ;;
  prod)
    APP_DOMAIN="https://app.sandwormlab.xyz"
    MCP_DOMAIN="https://mcp.sandwormlab.xyz"
    ;;
  *)
    echo "Usage: $0 [dev|staging|prod]"
    exit 1
    ;;
esac

API_ENV="$ROOT_DIR/apps/api/.env"
MCP_ENV="$ROOT_DIR/apps/mcp/.env"

if [ ! -f "$API_ENV" ]; then
  echo "✗ $API_ENV is missing — run scripts/setup-envs.sh first."
  exit 1
fi
touch "$MCP_ENV"
chmod 600 "$MCP_ENV"

get_env() {
  local file="$1" key="$2"
  grep "^${key}=" "$file" | tail -n 1 | cut -d '=' -f2- | tr -d "'" | tr -d '"'
}

set_env() {
  local file="$1" key="$2" value="$3"
  if grep -q "^${key}=" "$file"; then
    sed "s|^${key}=.*|${key}=${value}|" "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

# Keeps a value that is already there; writes the given one only when the key
# is missing or empty.
set_if_empty() {
  local file="$1" key="$2" value="$3"
  [ -n "$(get_env "$file" "$key")" ] || set_env "$file" "$key" "$value"
}

MCP_URL="$MCP_DOMAIN/mcp"

# ─── SHARED WITH THE API ─────────────────────────────────────────────────────
# The API rejects logins unless its resource equals the MCP's public URL, and
# both sides must hold the same introspection key.
INTROSPECT_KEY="$(get_env "$API_ENV" MCP_OAUTH_INTROSPECT_KEY)"
[ -n "$INTROSPECT_KEY" ] || INTROSPECT_KEY="$(get_env "$MCP_ENV" MCP_OAUTH_INTROSPECT_KEY)"
[ -n "$INTROSPECT_KEY" ] || INTROSPECT_KEY="$(openssl rand -hex 32)"

echo "▶ Updating API env ($ENV)..."
set_env "$API_ENV" MCP_OAUTH_RESOURCE "$MCP_URL"
set_env "$API_ENV" MCP_OAUTH_INTROSPECT_KEY "$INTROSPECT_KEY"
echo "✅ $API_ENV updated"

# ─── MCP ─────────────────────────────────────────────────────────────────────
echo "▶ Updating MCP env ($ENV)..."
set_env "$MCP_ENV" PORT "$MCP_PORT"
set_env "$MCP_ENV" MCP_PUBLIC_URL "$MCP_URL"
set_env "$MCP_ENV" AUTH_SERVER_URL "$APP_DOMAIN"
set_env "$MCP_ENV" WEB_URL "$APP_DOMAIN"
set_env "$MCP_ENV" API_URL "http://localhost:8003"
set_env "$MCP_ENV" MCP_OAUTH_INTROSPECT_KEY "$INTROSPECT_KEY"
set_if_empty "$MCP_ENV" LOG_TOOL_CALLS "true"

# Payments (Arbitrum MPP). The server will not start without these.
set_if_empty "$MCP_ENV" MPP_NETWORK "arbitrum-sepolia"
set_if_empty "$MCP_ENV" MPP_SECRET_KEY "$(openssl rand -hex 32)"
set_if_empty "$MCP_ENV" QUERY_PRICE "10000"
GENERATED_WALLET=false
if [ -z "$(get_env "$MCP_ENV" MPP_SERVER_PRIVATE_KEY)" ]; then
  set_env "$MCP_ENV" MPP_SERVER_PRIVATE_KEY "0x$(openssl rand -hex 32)"
  GENERATED_WALLET=true
fi
echo "✅ $MCP_ENV updated"

echo
echo "✅ MCP envs set for $ENV"
echo "   MCP:  $MCP_URL (port $MCP_PORT)"
echo "   Auth: $APP_DOMAIN"
if [ "$GENERATED_WALLET" = true ]; then
  echo
  echo "⚠ MPP_SERVER_PRIVATE_KEY was missing, so a new empty wallet key was generated."
  echo "  The server starts with it, but paid calls cannot settle until you replace it"
  echo "  with a funded wallet's key in $MCP_ENV."
fi

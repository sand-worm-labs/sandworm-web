#!/usr/bin/env bash
set -e

API_ENV="./apps/api/.env"
WEB_ENV="./apps/web/.env"

echo "▶ Running env setup..."

# === API .env ===
if [ ! -f "$API_ENV" ]; then
  echo "Creating API .env..."
  cat > "$API_ENV" <<EOL
##== Environment
NODE_ENV=development

##== Application
APP_NAME="Sandworm Analytics"
APP_URL=http://localhost:8003
APP_PORT=8003
APP_DEBUG=false
APP_FALLBACK_LANGUAGE=en
APP_HEADER_LANGUAGE=x-custom-lang
APP_LOG_LEVEL=debug
APP_LOG_SERVICE=console
APP_CORS_ORIGIN=*

##== API Configuration
API_PREFIX=api
FRONTEND_DOMAIN=http://localhost:3000
BACKEND_DOMAIN=http://localhost:3000

##== Swagger Documentation
SWAGGER_ENABLED=true
SWAGGER_TITLE=Sandworm API
SWAGGER_DESCRIPTION=Sandworm API Documentation for REST endpoints
SWAGGER_VERSION=1.0.0
SWAGGER_PATH=api-docs

##== Database
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=25432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=sandworm
DATABASE_SCHEMA=public
DATABASE_LOGGING=true
DATABASE_SYNCHRONIZE=false
DATABASE_MAX_CONNECTIONS=100
DATABASE_SSL_ENABLED=false
DATABASE_REJECT_UNAUTHORIZED=false
DATABASE_CA=
DATABASE_KEY=
DATABASE_CERT=

##== Authentication (JWT)
AUTH_JWT_SECRET=$(openssl rand -hex 24)
AUTH_JWT_TOKEN_EXPIRES_IN=15m
AUTH_REFRESH_SECRET=$(openssl rand -hex 24)
AUTH_REFRESH_TOKEN_EXPIRES_IN=3650d
AUTH_FORGOT_SECRET=$(openssl rand -hex 24)
AUTH_FORGOT_TOKEN_EXPIRES_IN=30m
AUTH_CONFIRM_EMAIL_SECRET=$(openssl rand -hex 24)
AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN=1d

##== Mail
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USER=
MAIL_PASSWORD=
MAIL_IGNORE_TLS=true
MAIL_SECURE=false
MAIL_REQUIRE_TLS=false
MAIL_DEFAULT_EMAIL=noreply@example.com
MAIL_DEFAULT_NAME=Api
MAIL_CLIENT_PORT=1080

##== Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

##== Jupyter
JUPYTER_HOST=localhost
JUPYTER_PORT=8888
JUPYTER_TOKEN=$(openssl rand -hex 24)
EOL

  echo "✅ Created $API_ENV"
fi

# === WEB .env ===
if [ ! -f "$WEB_ENV" ]; then
  echo "Creating Web .env..."
  cat > "$WEB_ENV" <<EOL
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8003
NEXT_PUBLIC_API_WS_URL=ws://localhost:8003/ws
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_PUBLIC_URL=http://localhost:3000
EOL
  echo "✅ Created $WEB_ENV"
fi

echo "▶ Env setup complete."

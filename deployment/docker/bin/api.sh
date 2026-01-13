#!/bin/bash
set -e

CONFIG_DIR="$HOME/.config/sandworm"
CONFIG_FILE="$CONFIG_DIR/sandworm.json"
SETUP_FILE="$CONFIG_DIR/setup"

log() {
    echo "[API] $1"
}

error() {
    echo "[API ERROR] $1" >&2
    exit 1
}

# Wait for setup to complete
wait_setup() {
    log "Waiting for setup to finish..."
    while [ -f "$SETUP_FILE" ]; do
        sleep 0.3
    done
    log "Setup completed"
}

# Wait for config file
wait_config() {
    log "Waiting for configuration file..."
    while [ ! -f "$CONFIG_FILE" ]; do
        sleep 0.3
    done
    log "Configuration file found"
}

# Load configuration
load_config() {
    log "Loading configuration..."
    
    if ! command -v jq &> /dev/null; then
        error "jq is not installed"
    fi
    
    # Read config with jq and export environment variables
    export NODE_ENV="production"
    export LOG_LEVEL="${LOG_LEVEL:-info}"
    export PORT="${PORT:-8080}"
    
    # Database
    export POSTGRES_HOST=$(jq -r '.POSTGRES_HOSTNAME // "localhost"' "$CONFIG_FILE")
    export POSTGRES_PORT=$(jq -r '.POSTGRES_PORT // "5432"' "$CONFIG_FILE")
    export POSTGRES_USERNAME=$(jq -r '.POSTGRES_USERNAME' "$CONFIG_FILE")
    export POSTGRES_PASSWORD=$(jq -r '.POSTGRES_PASSWORD' "$CONFIG_FILE")
    export POSTGRES_DATABASE=$(jq -r '.POSTGRES_DATABASE // "sandworm"' "$CONFIG_FILE")
    
    # Auth
    export LOGIN_JWT_SECRET=$(jq -r '.LOGIN_JWT_SECRET' "$CONFIG_FILE")
    export AUTH_JWT_SECRET=$(jq -r '.AUTH_JWT_SECRET' "$CONFIG_FILE")
    
    # AI Service
    export AI_API_URL="${AI_API_URL:-http://localhost:8000}"
    export AI_BASIC_AUTH_USERNAME=$(jq -r '.AI_BASIC_AUTH_USERNAME' "$CONFIG_FILE")
    export AI_BASIC_AUTH_PASSWORD=$(jq -r '.AI_BASIC_AUTH_PASSWORD' "$CONFIG_FILE")
    
    # Encryptionmain
    export ENVIRONMENT_VARIABLES_ENCRYPTION_KEY=$(jq -r '.ENVIRONMENT_VARIABLES_ENCRYPTION_KEY' "$CONFIG_FILE")
    export WORKSPACE_SECRETS_ENCRYPTION_KEY=$(jq -r '.WORKSPACE_SECRETS_ENCRYPTION_KEY' "$CONFIG_FILE")
    export DATASOURCES_ENCRYPTION_KEY=$(jq -r '.DATASOURCES_ENCRYPTION_KEY' "$CONFIG_FILE")
    
    # Jupyter
    export JUPYTER_HOST="${JUPYTER_HOST:-localhost}"
    export JUPYTER_PORT="${JUPYTER_PORT:-8888}"
    export JUPYTER_TOKEN=$(jq -r '.JUPYTER_TOKEN' "$CONFIG_FILE")
    
    # Other
    export PYTHON_ALLOWED_LIBRARIES="${PYTHON_ALLOWED_LIBRARIES:-plotly,matplotlib,numpy,pandas}"
    
    # Version from package.json
    if [ -f "/app/api/apps/api/package.json" ]; then
        export VERSION=$(jq -r '.version' /app/api/apps/api/package.json)
    fi
    
    log "Configuration loaded successfully"
}

# Run NestJS API
run_api() {
    log "Starting NestJS API..."
    
    if [ ! -f "/app/api/apps/api/dist/main.js" ]; then
        error "API build not found at /app/api/apps/api/dist/main.js"
    fi
    
    # Check if pino-pretty is available
    if [ -f "/app/api/node_modules/.bin/pino-pretty" ]; then
        log "Starting API with pino-pretty logging..."
        exec node /app/api/apps/api/dist/main.js | /app/api/node_modules/.bin/pino-pretty
    else
        log "pino-pretty not found, starting API with default logging..."
        exec node /app/api/apps/api/dist/main.js
    fi
}

# Main function
main() {
    wait_setup
    wait_config
    load_config
    run_api
}

main
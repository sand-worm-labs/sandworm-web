#!/bin/bash
set -e

CONFIG_DIR="$HOME/.config/sandworm"
CONFIG_FILE="$CONFIG_DIR/sandworm.json"
SETUP_FILE="$CONFIG_DIR/setup"

log() {
    echo "[AI] $1"
}

error() {
    echo "[AI ERROR] $1" >&2
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
    
    export BASIC_AUTH_USERNAME=$(jq -r '.AI_BASIC_AUTH_USERNAME' "$CONFIG_FILE")
    export BASIC_AUTH_PASSWORD=$(jq -r '.AI_BASIC_AUTH_PASSWORD' "$CONFIG_FILE")
    export PORT="${PORT:-8000}"
    
    log "Configuration loaded successfully"
}

# Run AI service
run_ai() {
    log "Starting AI service..."
    
    if [ ! -f "/app/ai/venv/bin/uvicorn" ]; then
        error "uvicorn not found at /app/ai/venv/bin/uvicorn"
    fi
    
    cd /app/ai || error "Failed to change to /app/ai"
    
    exec /app/ai/venv/bin/uvicorn api.app:app \
        --host 0.0.0.0 \
        --port "$PORT"
}

# Main function
main() {
    wait_setup
    wait_config
    load_config
    run_ai
}

main
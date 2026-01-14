#!/bin/bash
set -e

CONFIG_DIR="$HOME/.config/sandworm"
CONFIG_FILE="$CONFIG_DIR/sandworm.json"
SETUP_FILE="$CONFIG_DIR/setup"

log() {
    echo "[JUPYTER] $1"
}

error() {
    echo "[JUPYTER ERROR] $1" >&2
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
    
    export JUPYTER_TOKEN=$(jq -r '.JUPYTER_TOKEN' "$CONFIG_FILE")
    export PATH="/app/jupyter/venv/bin:$PATH"
    
    log "Configuration loaded successfully"
}

# Run Jupyter server
run_jupyter() {
    log "Starting Jupyter server..."
    
    if [ ! -f "/app/jupyter/venv/bin/jupyter" ]; then
        error "Jupyter not found at /app/jupyter/venv/bin/jupyter"
    fi
    
    cd /home/sandwormuser || error "Failed to change to /home/sandwormuser"
    
    exec /app/jupyter/venv/bin/jupyter server \
        --ip=0.0.0.0 \
        --port=8888 \
        --no-browser \
        --ServerApp.token="$JUPYTER_TOKEN" \
        --ServerApp.password='' \
        --ServerApp.allow_origin='*' \
        --ServerApp.base_url='/' \
        --ZMQChannelsWebsocketConnection.iopub_data_rate_limit=1.0e10 \
        --ZMQChannelsWebsocketConnection.iopub_msg_rate_limit=1.0e6 \
        --ServerApp.max_body_size=107374182400
}

# Main function
main() {
    wait_setup
    wait_config
    load_config
    run_jupyter
}

main
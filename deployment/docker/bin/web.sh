#!/usr/bin/env bash
set -e

CONFIG_DIR="$HOME/.config/sandworm"
SETUP_DONE="$CONFIG_DIR/setup.done"
SETUP_LOCK="$CONFIG_DIR/setup.lock"

log() {
    echo "[WEB] $1"
}

error() {
    echo "[WEB ERROR] $1" >&2
    exit 1
}

wait_setup() {
    log "Waiting for setup to complete..."

    mkdir -p "$CONFIG_DIR"

    local timeout=60  # seconds
    local waited=0

    while [ ! -f "$SETUP_DONE" ]; do
        if [ -f "$SETUP_LOCK" ]; then
            sleep 0.5
            waited=$(echo "$waited + 0.5" | bc)
        else
            error "Setup not running and setup.done not found"
        fi

        if (( $(echo "$waited >= $timeout" | bc -l) )); then
            error "Timed out waiting for setup"
        fi
    done

    log "Setup completed"
}

run_web() {
    log "Starting Next.js web application..."

    export NODE_ENV="${NODE_ENV:-production}"

    cd /app/web || error "Failed to change to /app/web"

    if [ -f "/app/web/apps/web/start.sh" ]; then
        exec bash /app/web/apps/web/start.sh
    else
        error "start.sh not found at /app/web/apps/web/start.sh"
    fi
}

main() {
    wait_setup
    run_web
}

main

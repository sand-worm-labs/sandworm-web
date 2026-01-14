#!/bin/bash
set -e

APPS_CONFIG_DIR="/home/sandworm/.config/sandworm"
JUPYTER_CONFIG_DIR="/home/sandwormuser/.config/sandworm"
CONFIG_FILE="$APPS_CONFIG_DIR/sandworm.json"
SETUP_MARKER_APPS="$APPS_CONFIG_DIR/setup"
SETUP_MARKER_JUPYTER="$JUPYTER_CONFIG_DIR/setup"

log() {
    echo "[SETUP] $1"
}

error() {
    echo "[SETUP ERROR] $1" >&2
    exit 1
}

# Generate random secret
generate_secret() {
    local size=${1:-32}
    openssl rand -hex "$size"
}

# Create setup marker files
create_markers() {
    log "Creating setup marker files..."
    mkdir -p "$APPS_CONFIG_DIR"
    mkdir -p "$JUPYTER_CONFIG_DIR"
    touch "$SETUP_MARKER_APPS"
    touch "$SETUP_MARKER_JUPYTER"
    chown sandworm:sandworm "$SETUP_MARKER_APPS"
    chown jupyteruser:jupyteruser "$SETUP_MARKER_JUPYTER"
}

# Generate config file
create_config() {
    log "Generating configuration file..."
    
    # Check environment variables or generate defaults
    NODE_ENV="${NODE_ENV:-production}"
    LOG_LEVEL="${LOG_LEVEL:-info}"
    POSTGRES_USERNAME="${POSTGRES_USERNAME:-sandworm}"
    POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$(generate_secret 8)}"
    POSTGRES_HOSTNAME="${POSTGRES_HOSTNAME:-localhost}"
    POSTGRES_PORT="${POSTGRES_PORT:-5432}"
    POSTGRES_DATABASE="${POSTGRES_DATABASE:-sandworm}"
    JUPYTER_TOKEN="${JUPYTER_TOKEN:-$(generate_secret 32)}"
    AI_BASIC_AUTH_USERNAME="${AI_BASIC_AUTH_USERNAME:-$(generate_secret 8)}"
    AI_BASIC_AUTH_PASSWORD="${AI_BASIC_AUTH_PASSWORD:-$(generate_secret 8)}"
    LOGIN_JWT_SECRET="${LOGIN_JWT_SECRET:-$(generate_secret)}"
    AUTH_JWT_SECRET="${AUTH_JWT_SECRET:-$(generate_secret)}"
    ENVIRONMENT_VARIABLES_ENCRYPTION_KEY="${ENVIRONMENT_VARIABLES_ENCRYPTION_KEY:-$(generate_secret 32)}"
    DATASOURCES_ENCRYPTION_KEY="${DATASOURCES_ENCRYPTION_KEY:-$(generate_secret 32)}"
    WORKSPACE_SECRETS_ENCRYPTION_KEY="${WORKSPACE_SECRETS_ENCRYPTION_KEY:-$(generate_secret 32)}"
    
    cat > "$CONFIG_FILE" <<EOF
{
    "NODE_ENV": "$NODE_ENV",
    "LOG_LEVEL": "$LOG_LEVEL",
    "POSTGRES_USERNAME": "$POSTGRES_USERNAME",
    "POSTGRES_PASSWORD": "$POSTGRES_PASSWORD",
    "POSTGRES_HOSTNAME": "$POSTGRES_HOSTNAME",
    "POSTGRES_PORT": "$POSTGRES_PORT",
    "POSTGRES_DATABASE": "$POSTGRES_DATABASE",
    "JUPYTER_TOKEN": "$JUPYTER_TOKEN",
    "AI_BASIC_AUTH_USERNAME": "$AI_BASIC_AUTH_USERNAME",
    "AI_BASIC_AUTH_PASSWORD": "$AI_BASIC_AUTH_PASSWORD",
    "LOGIN_JWT_SECRET": "$LOGIN_JWT_SECRET",
    "AUTH_JWT_SECRET": "$AUTH_JWT_SECRET",
    "ENVIRONMENT_VARIABLES_ENCRYPTION_KEY": "$ENVIRONMENT_VARIABLES_ENCRYPTION_KEY",
    "DATASOURCES_ENCRYPTION_KEY": "$DATASOURCES_ENCRYPTION_KEY",
    "WORKSPACE_SECRETS_ENCRYPTION_KEY": "$WORKSPACE_SECRETS_ENCRYPTION_KEY"
}
EOF
    
    chown sandworm:sandworm "$CONFIG_FILE"
    chmod 600 "$CONFIG_FILE"
    log "Configuration file created at $CONFIG_FILE"
}

# Load existing config
load_config() {
    log "Loading existing configuration..."
    
    # Export variables from config file, allowing env vars to override
    while IFS= read -r line; do
        key=$(echo "$line" | sed -n 's/.*"\([^"]*\)": "\([^"]*\)".*/\1/p')
        value=$(echo "$line" | sed -n 's/.*"\([^"]*\)": "\([^"]*\)".*/\2/p')
        
        if [ -n "$key" ] && [ -n "$value" ]; then
            # Use env var if set, otherwise use config value
            eval "export $key=\"\${$key:-$value}\""
        fi
    done < <(grep -o '"[^"]*": "[^"]*"' "$CONFIG_FILE")
}

# Wait for PostgreSQL to be ready
wait_postgres() {
    log "Waiting for PostgreSQL to be ready..."
    local max_attempts=60
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if psql -U sandworm -h localhost -d sandworm -c "SELECT 1" &>/dev/null; then
            log "PostgreSQL is ready!"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep 1
    done
    
    error "PostgreSQL failed to start after $max_attempts seconds"
}

# Setup PostgreSQL
setup_postgres() {
    log "Setting up PostgreSQL..."
    
    wait_postgres
    
    log "Changing PostgreSQL password..."
    PGPASSWORD="sandworm" psql -U sandworm -h localhost -d sandworm <<SQL
ALTER USER sandworm WITH PASSWORD '$POSTGRES_PASSWORD';
SQL
    
    log "PostgreSQL password updated"
}

# Run TypeORM migrations
run_migrations() {
    log "Running database migrations..."
    
    cd /app/api || error "Failed to change to /app/api directory"
    
    # Set environment variables for migrations
    export NODE_ENV="production"
    export POSTGRES_HOST="$POSTGRES_HOSTNAME"
    export POSTGRES_PORT="$POSTGRES_PORT"
    export POSTGRES_USERNAME="$POSTGRES_USERNAME"
    export POSTGRES_PASSWORD="$POSTGRES_PASSWORD"
    export POSTGRES_DATABASE="$POSTGRES_DATABASE"
    
    if npx typeorm migration:run -d apps/api/src/config/typeorm.config.ts; then
        log "Migrations completed successfully"
    else
        error "Migrations failed"
    fi
    
    cd - > /dev/null
}

# Setup Jupyter configuration
setup_jupyter() {
    log "Setting up Jupyter configuration..."
    
    mkdir -p "$JUPYTER_CONFIG_DIR"
    
    cat > "$JUPYTER_CONFIG_DIR/sandworm.json" <<EOF
{
    "JUPYTER_TOKEN": "$JUPYTER_TOKEN"
}
EOF
    
    chown -R jupyteruser:jupyteruser /home/sandwormuser
    chmod -R 700 /home/sandwormuser
    
    log "Jupyter configuration created"
}

# Remove setup marker files
remove_markers() {
    log "Removing setup markers..."
    rm -f "$SETUP_MARKER_APPS"
    rm -f "$SETUP_MARKER_JUPYTER"
}

# Main setup function
main() {
    log "Starting Sandworm setup..."
    
    create_markers
    
    if [ -f "$CONFIG_FILE" ]; then
        log "Configuration file exists, loading..."
        load_config
    else
        log "First run detected, creating configuration..."
        create_config
    fi
    
    setup_postgres
    run_migrations
    setup_jupyter
    remove_markers
    
    log "Setup completed successfully!"
}

main
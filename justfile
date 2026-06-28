# This file slightly simplifies starting the MC.
# the backend needs to have the token variable from .env loaded

set dotenv-load := true

# Start the backend
backend:
    cargo run

# Build the backend (for use with sudo)
build-backend:
    cargo build

# Start the backend with sudo, necessary for certain tty ports, but only works with default cargo target
backend-sudo: build-backend
    sudo INFLUXDB_TOKEN_LOCAL="$INFLUXDB_TOKEN_LOCAL" "target/debug/asteria-mission-control"

# Start the frontend
[working-directory('ui')]
frontend:
    npm run dev

# Starts the InfluxDB and Grafana (in the background, and restarts it first)
logging:
    docker compose --profile full down
    docker compose --profile logging up --detach

# Start both the backend and frontend
[parallel]
run: frontend backend logging

# Start the backend with sudo, and the frontend normally
[parallel]
run-sudo: frontend backend-sudo logging

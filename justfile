# This file slightly simplifies starting the MC

set dotenv-load := true

# Start the backend
backend:
    # needs to have variable from .env loaded
    cargo run

# Build the backend (for use with sudo)
build-backend:
    cargo build

# Start the backend with sudo, necessary for certain tty ports, but only works with default cargo target
backend-sudo:
    sudo "target/debug/asteria-mission-control"

# Start the frontend
[working-directory('ui')]
frontend:
    npm run dev

# Start both the backend and frontend
[parallel]
run: frontend backend

# Start the backend with sudo, and the frontend normally
[parallel]
run-sudo: frontend backend-sudo

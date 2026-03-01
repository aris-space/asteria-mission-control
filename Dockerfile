FROM node:22-alpine AS frontend-builder

WORKDIR /app
COPY ui /app

# set api url to empty, such that it uses api from the same host
ENV VITE_API_URL=

RUN npm install
RUN npm run build

FROM rust:alpine3.21 AS backend-builder

WORKDIR /app

COPY . .

# git dependency is needed for build script to determine version
RUN apk add --no-cache musl-dev git
# build with `static-frontend` feature enabled to serve the frontend using the actix web server
RUN cargo build --release --features static-frontend

FROM alpine:3.21 AS runner

WORKDIR /app
COPY --from=frontend-builder /app/dist /app/static
COPY --from=backend-builder /app/target/release/asteria-mission-control /usr/bin/asteria-mission-control

ENV FRONTEND_PATH=/app/static
ENV CONFIG_PATH=/app/config.toml
ENV BACKEND_ADDRESS=0.0.0.0
ENV BACKEND_PORT=80
ENV RUST_LOG=info

CMD [ "asteria-mission-control" ]
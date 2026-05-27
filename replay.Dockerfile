# Because mavlink-router doesn't provide an official docker image, we just clone the repository
# and build it ourselves here.
# Since our configs expect a mavlink-router on `localhost`, we need to run it inside the same container
# as the replay "remote computer".
FROM alpine:3.21 AS mavlink-router-builder

WORKDIR /app

RUN apk add --no-cache git gcc g++ pkgconf meson ninja linux-headers

RUN git clone --depth 1 --recurse-submodules https://github.com/mavlink-router/mavlink-router mavlink-router

RUN rm -rf mavlink-router/build
RUN meson setup -Dsystemdsystemunitdir=/usr/lib/systemd/system --buildtype=release mavlink-router/build mavlink-router
RUN ninja -C mavlink-router/build

FROM rust:alpine3.21 AS builder

WORKDIR /app

COPY . .

RUN apk add --no-cache musl-dev
RUN cargo build --package mavlink-log-replay --release

FROM alpine:3.21 AS runner

RUN apk add --no-cache bash libstdc++

WORKDIR /app
COPY --from=mavlink-router-builder /app/mavlink-router/build/src/mavlink-routerd /usr/bin/mavlink-routerd
COPY --from=builder /app/target/release/mavlink-log-replay /usr/bin/mavlink-log-replay

ENV REPLAY_REPEAT=true
ENV RUST_LOG=info

COPY <<EOF /entrypoint.sh
#!/bin/bash
set -e

# Spawn mavlink router instance.
mavlink-routerd &> /dev/null &

# Run command provided through docker.
"\$@"
EOF

RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]

CMD [ "mavlink-log-replay" ]
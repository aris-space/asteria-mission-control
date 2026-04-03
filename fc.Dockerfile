# Because mavlink-router doesn't provide an official docker image, we just clone the repository
# and build it ourselves here.
# Since our configs expect a mavlink-router on `localhost`, we need to run it inside the same container
# as the flight computer.
FROM alpine:3.21 AS mavlink-router-builder

WORKDIR /app

RUN apk add --no-cache git gcc g++ pkgconf meson ninja linux-headers

RUN git clone --depth 1 --recurse-submodules https://github.com/mavlink-router/mavlink-router mavlink-router

RUN rm -rf mavlink-router/build
RUN meson setup -Dsystemdsystemunitdir=/usr/lib/systemd/system --buildtype=release mavlink-router/build mavlink-router
RUN ninja -C mavlink-router/build

FROM rust:alpine3.21 AS flight-computer-builder

WORKDIR /app

COPY ./remote-computers .

# Use default of 'XX' as we often don't care inside the container.
ARG BUILDER_INITIALS=XX

# Git dependency is needed for build script to determine version.
RUN apk add --no-cache musl-dev git

RUN BUILDER_INITIALS=$BUILDER_INITIALS cargo build --release --package flight-computer

FROM alpine:3.21 AS runner

RUN apk add --no-cache bash libstdc++

WORKDIR /app
COPY --from=flight-computer-builder /app/target/release/flight-computer /usr/bin/flight-computer
COPY --from=mavlink-router-builder /app/mavlink-router/build/src/mavlink-routerd /usr/bin/mavlink-routerd
# Copy flight computer configs into `configs`.
COPY ./remote-computers/flight-computer/configs /app/configs

ENV RUST_LOG=info

COPY <<EOF /entrypoint.sh
#!/bin/bash
set -e

ip link add dev can0 type vcan
ip link set can0 up

# spawn mavlink router instance
mavlink-routerd &> /dev/null &

# run command provided through docker
"\$@"
EOF

RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]

CMD [ "flight-computer" ]

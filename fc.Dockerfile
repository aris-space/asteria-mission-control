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

RUN apk add --no-cache openssh bash libstdc++

WORKDIR /app
COPY --from=flight-computer-builder /app/target/release/flight-computer /usr/bin/flight-computer
COPY --from=mavlink-router-builder /app/mavlink-router/build/src/mavlink-routerd /usr/bin/mavlink-routerd
# Copy flight computer configs into `configs`.
COPY ./remote-computers/flight-computer/configs /app/configs

# Copy the output of a `ssh-keygen -A` to prevent
# host identification key mismatches between builds.
COPY <<EOF /etc/ssh/ssh_host_ecdsa_key
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAaAAAABNlY2RzYS
1zaGEyLW5pc3RwMjU2AAAACG5pc3RwMjU2AAAAQQTdeSU0+oet2LQcVzYQaVYlXqlrsCfP
MFffO/C+0uJGOQmVVUqJewZBdXPFNsvRy1mbPY78NM01ZGm71qE3PCs2AAAAsP+ZYWj/mW
FoAAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBN15JTT6h63YtBxX
NhBpViVeqWuwJ88wV9878L7S4kY5CZVVSol7BkF1c8U2y9HLWZs9jvw0zTVkabvWoTc8Kz
YAAAAhAPU2eVn5kcdmSLoCuow9VXU/G0AdioJqbHC4xBhTPbhvAAAAEXJvb3RAZTI4Nzdi
YzUxNjJkAQIDBAUG
-----END OPENSSH PRIVATE KEY-----
EOF
COPY <<EOF /etc/ssh/ssh_host_ecdsa_key.pub
ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBN15JTT6h63YtBxXNhBpViVeqWuwJ88wV9878L7S4kY5CZVVSol7BkF1c8U2y9HLWZs9jvw0zTVkabvWoTc8KzY= root@local
EOF

COPY <<EOF /etc/ssh/ssh_host_ed25519_key
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBiLnQOZfO35AEH002PzuIUpvPdMKkbSE6jImp4BZqhhwAAAJjWwGw71sBs
OwAAAAtzc2gtZWQyNTUxOQAAACBiLnQOZfO35AEH002PzuIUpvPdMKkbSE6jImp4BZqhhw
AAAECkQ73qAQjTZfuKWgv7WREEZ8Awfn7bZ5y4YMSifXlrTGIudA5l87fkAQfTTY/O4hSm
890wqRtITqMiangFmqGHAAAAEXJvb3RAZTI4NzdiYzUxNjJkAQIDBA==
-----END OPENSSH PRIVATE KEY-----
EOF
COPY <<EOF /etc/ssh/ssh_host_ed25519_key.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGIudA5l87fkAQfTTY/O4hSm890wqRtITqMiangFmqGH root@local
EOF

COPY <<EOF /etc/ssh/ssh_host_rsa_key
-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----
EOF
COPY <<EOF /etc/ssh/ssh_host_rsa_key.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCzKTbZn4TcgMeSLTcHdxsVf4wY8JSxraKnZ2JWKtbLw6qU9XPddCUr+t2uSVqCAIAKaxZ9lkXFwE07udMsTpjJ/64AxEYEheqIT0YQsVVJXZTwKeoxAc3GmeDA+nJFDbiDoK2YwyNb3RzBmWUuXP+QfXNVn8uEDjLybMQX48pWkIUYvMk7uJPoIfpKC+euj7+cPpXDIyLfyJGuQavU+kvvEHBingoHN9ucrQjrW0k4hFJbl6HaFk0YPbFlR/lBGy3KkS8XqjmlKkIOCcknEPZOUTIgDNhslaGYaZpjR6tmzZQzdycoXL4Fnbe8RRWX7VAvcbEi4e8ifd6AQlEr9HJwof4JHJ2zjEoJg2SYKO2TPi97CNZCVBFW3BRjXFVMRF60zRjCAVyS/ER7VHBapwGQ9ltnJTf34PWNDGEbjlAafUJstq7xO5DmjLU2pMaa7ppyE/qIaL4j6h1O5rAO1lGoUdBa4f5yp82fR6T1yJRmKzJXl4d67asLWu3NNK9L9hc= root@local
EOF

RUN chmod 600 /etc/ssh/ssh_host_*_key*

# Remove ssh message of the day.
RUN echo > /etc/motd

ENV RUST_LOG=info

COPY <<EOF /entrypoint.sh
#!/bin/bash
set -e

# Create and start virtual CAN interface.
ip link add dev can0 type vcan
ip link set can0 up

# Spawn mavlink router instance.
mavlink-routerd &> /dev/null &

# Set root password to empty.
passwd -d root

# Run ssh daemon.
/usr/sbin/sshd -o UsePAM=no -o PermitRootLogin=yes -o PubkeyAuthentication=no -o PasswordAuthentication=yes -o PermitEmptyPasswords=yes &

# Run command provided through docker.
"\$@"
EOF

RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]

CMD [ "flight-computer" ]

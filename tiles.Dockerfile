# An alpine base image to provide /bin/sh for `RUN` to work.
FROM alpine:3.22 AS shell

FROM protomaps/go-pmtiles:latest AS pmtiles

FROM shell AS extractor

WORKDIR /tiles

# Get coordinates from <https://bboxfinder.com>.
ENV BBOX_DUEBENDORF="8.617401,47.389285,8.677826,47.409619"

# Mount the pmtiles binary from the official Protomaps image (hacky workaround
# that we don't have a shell but works).
RUN --mount=type=bind,from=pmtiles,source=/go-pmtiles,target=/usr/local/bin/pmtiles \
    pmtiles extract \
      https://build.protomaps.com/20250324.pmtiles \
      duebendorf.pmtiles \
      --bbox="$BBOX_DUEBENDORF"


FROM nginx:alpine

# The fonts are served under `/fonts/`, the sprites under `/sprites/`
# and all downloaded bounding boxes are served under `/` (e.g., a bounding
# box named `portugal.pmtiles` will be served under `/portugal.pmtiles`.
COPY --from=extractor /tiles/ /usr/share/nginx/html/
COPY ./tiles/fonts/ /usr/share/nginx/html/fonts/
COPY ./tiles/sprites/ /usr/share/nginx/html/sprites/

# Inline nginx configuration.
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;

    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Range" always;
    add_header Access-Control-Expose-Headers "Content-Length, Content-Range, Accept-Ranges, ETag" always;

    location / {
        if ($request_method = OPTIONS) {
            return 204;
        }

        try_files $uri =404;
    }
}
EOF

EXPOSE 80
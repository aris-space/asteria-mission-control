# An alpine base image to provide /bin/sh for `RUN` to work.
FROM alpine:3.22 AS shell

FROM protomaps/go-pmtiles:latest AS pmtiles

# Extraction environment
FROM shell AS extractor

# # Get coordinates from <https://bboxfinder.com>
ENV BBOX_DUEBENDORF="8.617401,47.389285,8.677826,47.409619"

WORKDIR /tiles

# Mount the pmtiles binary from the official Protomaps image
RUN --mount=type=bind,from=pmtiles,source=/go-pmtiles,target=/usr/local/bin/pmtiles \
    pmtiles extract \
      https://build.protomaps.com/20250324.pmtiles \
      duebendorf.pmtiles \
      --bbox="$BBOX_DUEBENDORF"


# FROM protomaps/go-pmtiles:latest

# # Copy the extracted tiles from the first stage
# COPY --from=extractor /tiles /tiles

# # Expose the default pmtiles port
# EXPOSE 8080

# # Serve the directory.
# # Your tiles will be available at:
# # http://localhost:8080/munich/{z}/{x}/{y}.mvt
# # http://localhost:8080/london/{z}/{x}/{y}.mvt
# CMD ["serve", "/tiles", "--cors=*"]

FROM nginx:alpine

COPY --from=extractor /tiles/ /usr/share/nginx/html/

# Inline nginx configuration
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;

    location / {
        try_files $uri =404;
    }

    location ~ \.pmtiles$ {
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Range" always;
        add_header Access-Control-Expose-Headers "Content-Length, Content-Range, Accept-Ranges, ETag" always;

        if ($request_method = OPTIONS) {
            return 204;
        }

        try_files $uri =404;
    }
}
EOF

EXPOSE 80
# Official PocketBase release zip, for the target Docker architecture.
# GitHub-hosted v0.40.6 is pinned intentionally; update with review + migration testing.
FROM alpine:3.21
ARG TARGETARCH
ARG POCKETBASE_VERSION=0.40.6
RUN apk add --no-cache ca-certificates wget unzip \
    && case "$TARGETARCH" in amd64|arm64) ;; *) echo "Unsupported arch: $TARGETARCH" >&2; exit 1;; esac \
    && wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_${TARGETARCH}.zip" -O /tmp/pocketbase.zip \
    && mkdir -p /pb \
    && unzip -j /tmp/pocketbase.zip pocketbase -d /pb \
    && chmod +x /pb/pocketbase \
    && rm /tmp/pocketbase.zip
WORKDIR /pb
EXPOSE 8090
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]

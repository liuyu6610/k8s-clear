# Build the manager binary
FROM golang:1.25.3 AS builder

ARG BUILDOS
ARG TARGETARCH
ARG VERSION=dev
ARG COMMIT=unknown
ARG BUILD_TIME=unknown

WORKDIR /workspace

# Copy the Go Modules manifests
COPY go.mod go.mod
COPY go.sum go.sum

# Cache deps before building and copying source so that we don't need to re-download as much
# and so that source changes don't invalidate our downloaded layer
RUN go mod download

# Copy the go source
COPY cmd/ cmd/
COPY api/ api/
COPY internal/ internal/
COPY pkg/ pkg/

# Build with version info
RUN CGO_ENABLED=0 GOOS=$BUILDOS GOARCH=$TARGETARCH \
    go build -a -ldflags "\
        -X main.version=${VERSION} \
        -X main.commit=${COMMIT} \
        -X main.buildTime=${BUILD_TIME} \
        -s -w" \
    -o manager cmd/main.go

# Use distroless as minimal base image to package the manager binary
# Refer to https://github.com/GoogleContainerTools/distroless for more details
FROM gcr.io/distroless/static:nonroot
WORKDIR /
COPY --from=builder /workspace/manager .
USER 65532:65532

# Expose metrics and healthz ports
EXPOSE 8443 9440

ENTRYPOINT ["/manager"]

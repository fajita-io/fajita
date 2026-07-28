# Monitor worker (Go)
# Build: docker build -t fajita-monitor-worker services/monitor-worker
# Deploy target: Fly.io or any always-on container platform

FROM golang:1.26-alpine AS build
WORKDIR /src
COPY services/monitor-worker/go.mod services/monitor-worker/go.sum ./
COPY packages/monitor-contracts /packages/monitor-contracts
RUN go mod download
COPY services/monitor-worker/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /fajita-worker ./cmd/worker

FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=build /fajita-worker /app/fajita-worker
ENV MONITOR_WORKER_HTTP_PORT=8080
EXPOSE 8080
USER nobody
ENTRYPOINT ["/app/fajita-worker"]

#!/usr/bin/env bash
set -euo pipefail

export PATH="${HOME}/.local/bin:/usr/local/bin:${PATH}"

PORT="${HEADROOM_PORT:-8787}"
PROJECT_SLUG="${HEADROOM_PROJECT_SLUG:-fajita-io}"

export HEADROOM_TELEMETRY="${HEADROOM_TELEMETRY:-off}"
export HEADROOM_OUTPUT_SHAPER="${HEADROOM_OUTPUT_SHAPER:-1}"

if ! command -v headroom >/dev/null 2>&1; then
  echo "headroom not found. Install with:"
  echo "  uv tool install --python /usr/local/bin/python3.12 \"headroom-ai[proxy,mcp]\""
  exit 1
fi

if curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
  echo "Headroom proxy already running on port ${PORT}"
else
  echo "Starting Headroom proxy on port ${PORT}..."
  headroom proxy --port "${PORT}" &
  for _ in $(seq 1 30); do
    if curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
      break
    fi
    sleep 0.5
  done
fi

cat <<EOF

Headroom is ready for fajita-io.

Cursor model routing (Settings > Models > Override Base URL):
  OpenAI:     http://127.0.0.1:${PORT}/p/${PROJECT_SLUG}/v1
  Anthropic:  http://127.0.0.1:${PORT}/p/${PROJECT_SLUG}

Use your normal provider API keys in Cursor. Traffic routes through Headroom
for input compression and output shaping.

Health:      http://127.0.0.1:${PORT}/health
Dashboard:   headroom dashboard
Doctor:      headroom doctor
Savings:     headroom savings

EOF

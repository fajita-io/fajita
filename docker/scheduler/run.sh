#!/bin/sh
# Lightweight scheduler sidecar for self-hosted deployments.
# Hits Fajita cron routes on a fixed interval using CRON_SECRET.
set -eu

WEB_URL="${FAJITA_WEB_URL:-http://web:3000}"
SECRET="${CRON_SECRET:?CRON_SECRET is required}"
INTERVAL="${SCHEDULER_INTERVAL_SECONDS:-60}"

echo "Scheduler starting. Web: $WEB_URL interval: ${INTERVAL}s"

while true; do
  # Monitor tick every interval (default 60s; production cloud uses 1 min).
  wget -qO- --header="Authorization: Bearer $SECRET" \
    "$WEB_URL/api/cron/monitor-tick" >/dev/null 2>&1 || \
    echo "monitor-tick failed at $(date -Iseconds)" >&2

  # Maintenance tick hourly at minute 5 equivalent: run when minute mod 60 == 5
  minute="$(date +%M)"
  if [ "$minute" = "05" ]; then
    wget -qO- --header="Authorization: Bearer $SECRET" \
      "$WEB_URL/api/cron/tick" >/dev/null 2>&1 || \
      echo "maintenance tick failed at $(date -Iseconds)" >&2
  fi

  sleep "$INTERVAL"
done

#!/bin/sh
set -e
# EasyPanel injects PORT and HOST; Next standalone listens on PORT + HOSTNAME.
export HOSTNAME="${HOSTNAME:-${HOST:-0.0.0.0}}"
export PORT="${PORT:-3000}"
export DATA_DIR="${DATA_DIR:-/app/data/store}"
mkdir -p "$DATA_DIR" /app/public/products
if [ "$(id -u)" = "0" ]; then
  chown -R nextjs:nodejs "$DATA_DIR" 2>/dev/null || true
  exec su-exec nextjs node server.js
fi
exec node server.js

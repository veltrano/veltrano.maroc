#!/bin/sh
set -e
# EasyPanel injects PORT and HOST; Next standalone listens on PORT + HOSTNAME.
export HOSTNAME="${HOSTNAME:-${HOST:-0.0.0.0}}"
export PORT="${PORT:-3000}"
export DATA_DIR="${DATA_DIR:-/app/data/store}"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://veltrano.ma}"
export SITE_URL="${SITE_URL:-${NEXT_PUBLIC_SITE_URL}}"
mkdir -p "$DATA_DIR" /app/public/products
# If EasyPanel mounted an empty volume over /app/public/products, restore baked JPEGs.
if [ -d /opt/veltrano-catalog ] && [ -z "$(find /app/public/products -name '*.jpg' -print -quit 2>/dev/null)" ]; then
  cp -a /opt/veltrano-catalog/. /app/public/products/
fi
if [ "$(id -u)" = "0" ]; then
  chown -R nextjs:nodejs "$DATA_DIR" /app/public/products 2>/dev/null || true
  exec su-exec nextjs node server.js
fi
exec node server.js

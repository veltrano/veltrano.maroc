# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SITE_URL=https://veltrano.ma
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx next build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATA_DIR=/app/data/store
ENV NEXT_PUBLIC_SITE_URL=https://veltrano.ma
ENV SITE_URL=https://veltrano.ma

RUN apk add --no-cache su-exec \
  && addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001 -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder /app/public/products /opt/veltrano-catalog
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/scripts/migrate.mjs /app/scripts/backfill-json.mjs ./scripts/
COPY --from=deps /app/node_modules/postgres ./node_modules/postgres
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod 755 /app/docker-entrypoint.sh \
  && mkdir -p /app/data/store /app/public/products \
  && chown -R nextjs:nodejs /app/data /app/public /opt/veltrano-catalog

EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]

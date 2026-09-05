# syntax=docker/dockerfile:1

# ── Build the Next.js app (standalone output) ────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@10

# Install deps first (cached until the lockfile changes).
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
# Relative + constant, so it's safe to bake at build time. The browser calls
# /api/sanctum/* on this same origin; the route handler proxies to Laravel.
ENV NEXT_PUBLIC_SANCTUM_BASE_URL=/api/sanctum
# Server-only. Needed at build too: the proxy route handler validates this at
# module load (Next evaluates it while collecting page data). The real value is
# injected at runtime by compose; this only satisfies the build-time check.
ENV SANCTUM_BASE_URL=http://api
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ── Runtime image (just the standalone server) ───────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

# Railway when Root Directory = ketujemi-2. pnpm via npm global (no corepack).
FROM node:22-bookworm-slim AS base
RUN corepack disable 2>/dev/null || true
ENV COREPACK_ENABLE_STRICT=0
RUN npm install -g pnpm@10.12.1
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY artifacts/api-server/package.json artifacts/api-server/
COPY artifacts/vendi/package.json artifacts/vendi/
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/
COPY lib/db/package.json lib/db/
COPY lib/api-spec/package.json lib/api-spec/
COPY lib/api-zod/package.json lib/api-zod/
COPY lib/api-client-react/package.json lib/api-client-react/
COPY lib/integrations/ lib/integrations/
COPY scripts/package.json scripts/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
ENV NODE_ENV=production
ENV BASE_PATH=/
ENV PORT=8080
RUN node ./scripts/build-production.mjs

FROM node:22-bookworm-slim AS runner
RUN corepack disable 2>/dev/null || true
ENV COREPACK_ENABLE_STRICT=0
ENV NODE_ENV=production
ENV PORT=8080
ENV STATIC_ROOT=/app/artifacts/vendi/dist/public
WORKDIR /app
COPY --from=build /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=build /app/artifacts/vendi/dist/public ./artifacts/vendi/dist/public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/artifacts/api-server/node_modules ./artifacts/api-server/node_modules
COPY --from=build /app/lib ./lib
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s \
  CMD node -e "fetch('http://127.0.0.1:8080/api/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]

# Railway builds from the repository root; application code lives in ketujemi-2/.
FROM node:22-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate
WORKDIR /app

FROM base AS deps
COPY ketujemi-2/package.json ketujemi-2/pnpm-lock.yaml ketujemi-2/pnpm-workspace.yaml ./
COPY ketujemi-2/artifacts/api-server/package.json artifacts/api-server/
COPY ketujemi-2/artifacts/vendi/package.json artifacts/vendi/
COPY ketujemi-2/artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/
COPY ketujemi-2/lib/db/package.json lib/db/
COPY ketujemi-2/lib/api-spec/package.json lib/api-spec/
COPY ketujemi-2/lib/api-zod/package.json lib/api-zod/
COPY ketujemi-2/lib/api-client-react/package.json lib/api-client-react/
COPY ketujemi-2/lib/integrations/ lib/integrations/
COPY ketujemi-2/scripts/package.json scripts/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY ketujemi-2/ .
ENV NODE_ENV=production
ENV BASE_PATH=/
ENV PORT=8080
RUN node ./scripts/build-production.mjs

FROM base AS runner
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

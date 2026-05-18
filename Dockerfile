# Railway builds from the repository root; application code lives in ketujemi-2/.
# Uses npm workspaces (no corepack/pnpm).
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY ketujemi-2/ .
RUN node ./scripts/prepare-npm-install.mjs
RUN npm install --workspaces --include-workspace-root --ignore-scripts
ENV NODE_ENV=production
ENV USE_NPM=1
ENV BASE_PATH=/
ENV PORT=8080
RUN node ./scripts/build-production.mjs

FROM node:22-bookworm-slim AS runner
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

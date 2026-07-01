# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

# ---- development (utilisée par docker-compose en local) --------------------
FROM base AS development
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY api/package.json ./api/package.json
COPY database/package.json ./database/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN pnpm install --frozen-lockfile || pnpm install
COPY . .
RUN pnpm --filter @legacy/database prisma:generate
EXPOSE 3001
CMD ["pnpm", "--filter", "@legacy/api", "dev"]

# ---- build -------------------------------------------------------------------
FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @legacy/database prisma:generate
RUN pnpm --filter @legacy/api build

# ---- production ---------------------------------------------------------------
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/api/dist ./dist
COPY --from=build /app/api/node_modules ./node_modules
COPY --from=build /app/node_modules ./root_node_modules
EXPOSE 3001
CMD ["node", "dist/main.js"]

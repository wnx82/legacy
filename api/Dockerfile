# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
# Requis par le moteur Prisma sur Alpine (musl) — sans ce paquet, le client
# Prisma ne peut pas charger sa librairie native au runtime.
RUN apk add --no-cache openssl
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
# @legacy/shared est rebuilt à chaque démarrage : le volume bind-mount de
# /app/packages (voir docker-compose.yml) écrase le dist/ généré à l'image.
CMD ["sh", "-c", "pnpm --filter @legacy/shared build && pnpm --filter @legacy/api dev"]

# ---- build -------------------------------------------------------------------
FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @legacy/database prisma:generate
RUN pnpm --filter @legacy/shared build
RUN pnpm --filter @legacy/api build

# ---- production ---------------------------------------------------------------
# node_modules/@legacy/* sont des liens symboliques pnpm vers /app/packages et
# /app/database : ces dossiers doivent être copiés en plus des node_modules.
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/api/dist ./api/dist
COPY --from=build /app/api/node_modules ./api/node_modules
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/database ./database
EXPOSE 3001
CMD ["node", "api/dist/main.js"]

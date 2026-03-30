# Étape 1 : Build
FROM node:20-alpine AS builder

WORKDIR /workspace

RUN npm install -g pnpm

# Copie des fichiers de configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Installation de TOUTES les dépendances (dev + prod)
RUN pnpm install --frozen-lockfile

# Copie des sources
COPY apps/backend/ ./apps/backend/

# Build
RUN pnpm --filter @novelya/backend build

# Installation UNIQUEMENT des dépendances de production pour le backend
RUN pnpm --filter @novelya/backend deploy --prod --legacy /tmp/deploy

# Copie des fichiers buildés et docs dans le dossier deploy
RUN cp -r /workspace/apps/backend/dist /tmp/deploy/ && \
    cp -r /workspace/apps/backend/src/docs /tmp/deploy/dist/


# Étape 2 : Production
FROM node:20-alpine

WORKDIR /workspace

# Copie du dossier deploy qui contient tout ce qu'il faut
COPY --from=builder /tmp/deploy ./

EXPOSE 3000

CMD ["node", "dist/server.js"]

# Étape 1 : Build
FROM node:20-alpine AS builder

# Définit le dossier racine du conteneur
WORKDIR /workspace

# Arguments de build (depuis docker-compose.yaml)
ARG NOVELYA_API_URL

# Copie ARG dans des variables d'environnement pour Angular
ENV NOVELYA_API_URL=$NOVELYA_API_URL

# Installation de pnpm
RUN npm install -g pnpm

# Copie des fichiers de configuration nécessaires pour installer les dépendances
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copie des fichiers package.json des workspaces
COPY apps/frontend/package.json ./apps/frontend/

# Installation des dépendances
RUN pnpm install --frozen-lockfile

# Copie de tous les fichiers nécessaires pour le build
COPY apps/frontend/ ./apps/frontend/

# Build de l'application frontend Angular
RUN pnpm --filter @novelya/frontend build


# Étape 2 : Production
FROM nginx:alpine

# Copie des fichiers statiques générés par le build vers le dossier de nginx
COPY --from=builder /workspace/apps/frontend/dist/novelya-front/browser /usr/share/nginx/html

# Configuration de nginx pour Angular Router (SPA)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose le port sur lequel nginx écoute
EXPOSE 80

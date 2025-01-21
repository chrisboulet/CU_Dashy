# Étape de build
FROM node:16-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY conf.yml ./

# Build l'application
RUN npm run build

# Étape de production avec Dashy
FROM lissy93/dashy:latest

# Copier la configuration et les fichiers buildés
COPY --from=builder /app/dist /app/public
COPY --from=builder /app/conf.yml /app/public/conf.yml

# Variables d'environnement par défaut
ENV PORT=80 \
    NODE_ENV=production

# Exposer le port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/healthcheck || exit 1

# Le conteneur Dashy gère lui-même le démarrage

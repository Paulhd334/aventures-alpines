FROM node:18-alpine

# Désactiver debug
ENV DEBUG=''

WORKDIR /app

# Copier package.json d'abord (pour le cache)
COPY package.json package-lock.json ./

# Installer les dépendances EXACTES
RUN npm ci --only=production --no-audit

# Copier le reste
COPY . .

# Port
EXPOSE 5000

# Démarrer
CMD ["node", "server.js"]
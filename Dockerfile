# ========================================================
# Étape 1 : Construction de l'application (Vite + React)
# ========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json package-lock.json* bun.lock* ./

# Installation des dépendances du projet
RUN npm install

# Copie du code source complet
COPY . .

# Compilation pour la production (génère le dossier /app/dist)
RUN npm run build

# ========================================================
# Étape 2 : Image d'exécution Nginx ultra-légère et rapide
# ========================================================
FROM nginx:alpine AS runner

# Configuration Nginx optimisée pour React SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers statiques compilés depuis l'étape précédente
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposition du port HTTP 80
EXPOSE 80

# Démarrage de Nginx
CMD ["nginx", "-g", "daemon off;"]

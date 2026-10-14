# syntax=docker/dockerfile:1

# ========================================================
# Étape 1 : dépendances (sert aussi d'image de développement)
# ========================================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ========================================================
# Étape 2 : build du front (Vite) et du serveur Express
# ========================================================
FROM deps AS builder

COPY . .

# Netlify Image CDN n'existe pas hors Netlify : images servies telles quelles.
ENV VITE_IMAGE_CDN=false
RUN npm run build && npm run build:server

# ========================================================
# Étape 3 : image d'exécution (Express + fichiers statiques)
# ========================================================
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi \
  && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]

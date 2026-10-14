# Lancer TerangaMall avec Docker

Prérequis : Docker et Docker Compose. Optionnel : copier `.env.example` en `.env` pour les clés PayDunya.

## Version production (front compilé + API Express)
```bash
docker compose up --build
```
→ http://localhost:3000 (changer le port : `PORT=8080 docker compose up --build`)

## Version développement (rechargement à chaud)
```bash
docker compose --profile dev up dev
```
→ http://localhost:5173 — le code est monté en volume, les modifications sont prises en compte immédiatement.

## Commandes utiles
- Logs : `docker compose logs -f`
- Arrêter : `docker compose down`
- Mettre à jour : `git pull && docker compose up -d --build`

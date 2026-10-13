# 🚀 Guide de Déploiement Docker sur Votre Propre Serveur

Ce guide vous explique étape par étape comment déployer votre marketplace **TerangaMall** sur votre propre serveur dédié ou VPS (OVH, Hetzner, DigitalOcean, Linode, AWS, etc.).

---

## 📋 Prérequis
- Un serveur Linux (Ubuntu 22.04 / 24.04 recommandé ou Debian).
- **Docker** et **Docker Compose** installés sur votre serveur.

Pour installer Docker en une seule ligne si ce n'est pas encore fait :
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

---

## ⚡ 1. Démarrage Rapide (En 1 seule commande)

Depuis le dossier racine du projet sur votre serveur :

```bash
docker compose up -d --build
```

Votre application est immédiatement disponible sur :
👉 **`http://IP-DE-VOTRE-SERVEUR:3000`** (ou `http://localhost:3000`)

---

## 🌐 2. Changer le Port (Exemple : Port 80 direct)

Si vous souhaitez que le site soit directement accessible sur le port web standard 80 :

```bash
PORT=80 docker compose up -d --build
```

---

## 🔒 3. Mettre en Ligne avec Nom de Domaine & HTTPS Gratuit (Certbot SSL)

Si vous possédez un nom de domaine (ex: `mondomaine.sn` ou `boutique.com`), configurez Nginx ou Caddy sur l'hôte en reverse-proxy :

### Exemple de Reverse-Proxy Nginx sur l'hôte :
```nginx
server {
    server_name mondomaine.sn www.mondomaine.sn;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Puis activez le certificat SSL gratuit en une commande :
```bash
sudo certbot --nginx -d mondomaine.sn -d www.mondomaine.sn
```

---

## 🛠️ 4. Commandes Utiles au Quotidien

- **Voir les logs en direct :**
  ```bash
  docker compose logs -f
  ```

- **Mettre à jour après modification du code :**
  ```bash
  git pull
  docker compose up -d --build
  ```

- **Vérifier l'état du conteneur :**
  ```bash
  docker compose ps
  ```

- **Arrêter l'application :**
  ```bash
  docker compose down
  ```

- **Redémarrer l'application :**
  ```bash
  docker compose restart
  ```

---

## 🔑 5. Variables d'Environnement & API PayDunya

Si vous utilisez les passerelles de paiement ou des clés personnalisées, créez un fichier `.env` sur votre serveur à la racine :

```env
# Clés API PayDunya Sénégal (Wave, Orange Money, Free Money, Carte)
PAYDUNYA_MASTER_KEY="votre_cle_master"
PAYDUNYA_PRIVATE_KEY="votre_cle_privee"
PAYDUNYA_TOKEN="votre_token"

# Mode de test ou production :
# Valeur recommandée : "test" pour le Sandbox ou "live" pour la production
# NOTE : Si vous avez mis "Mode test", l'application le tolère automatiquement et active le Sandbox !
PAYDUNYA_MODE="test"
```

---

## 💡 Avantages de cette Configuration
- **Ultra-léger** : Utilise l'image `nginx:alpine` (consomme moins de 20 Mo de RAM).
- **Routage SPA complet** : Gère toutes les URL React sans erreur 404 lors du rafraîchissement.
- **Compression Gzip** : Optimise la vitesse de chargement sur mobile 4G/5G.
- **Redémarrage automatique** : Si le serveur redémarre, le conteneur se relance automatiquement (`restart: unless-stopped`).

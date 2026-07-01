# Déploiement

Ce dépôt est livré prêt pour un **lancement local** via Docker Compose
(voir `installation.md`). Ce document couvre les adaptations nécessaires
pour un déploiement réel, sans les implémenter (hors périmètre du MVP).

## Principes recommandés

- **Hébergement européen**, pour simplifier la conformité RGPD (voir
  `rgpd.md`).
- **Environnements séparés** (development / staging / production), chacun
  avec ses propres secrets et bases de données — ne jamais réutiliser les
  identifiants de développement définis dans `.env.example`.
- **Secrets hors du dépôt** : gestionnaire de secrets (Vault, Doppler, ou
  au minimum variables d'environnement injectées par la plateforme
  d'hébergement), jamais de fichier `.env` réel committé.

## De Docker Compose vers un VPS / serveur dédié

`infra/docker-compose.yml` est utilisable tel quel comme base pour un
premier déploiement sur un VPS :

1. Remplacer `start-dev --import-realm` de Keycloak par un déploiement en
   mode production (`start` avec certificats TLS, `KC_HOSTNAME_STRICT=true`).
2. Ajouter un reverse proxy (Traefik, Nginx ou Caddy) devant l'API et les
   trois apps Next.js pour la terminaison TLS et le routage par domaine.
3. Remplacer les volumes Docker locaux de PostgreSQL/MinIO par des volumes
   persistants sauvegardés régulièrement (voir section Sauvegardes).
4. Construire les images de production :
   - API : `docker build --target production -f api/Dockerfile .`
   - Apps Next.js : `next build` puis `next start`, ou déploiement sur une
     plateforme (Vercel, ou conteneur Node standard).
5. Ne jamais exposer publiquement les ports d'administration (Adminer,
   MinIO console, Keycloak admin) sans authentification réseau
   supplémentaire (VPN, IP allowlist).

## Base de données

- Séparer PostgreSQL de Keycloak/Umami en production si la charge le
  justifie (le choix « une seule instance, plusieurs bases » documenté dans
  `infra/README.md` est un choix de simplicité pour le développement local).
- Appliquer les migrations avec `prisma migrate deploy` (pas
  `migrate dev`) en production.
- Sauvegardes chiffrées automatisées et testées régulièrement (restauration
  vérifiée, pas seulement la sauvegarde).

## Stockage documentaire

MinIO peut rester tel quel (auto-hébergé) ou être remplacé par un service
managé compatible S3 (Scaleway Object Storage, OVH Object Storage, AWS S3)
en changeant uniquement `MINIO_ENDPOINT`/`MINIO_ACCESS_KEY`/
`MINIO_SECRET_KEY` — le code applicatif (`StorageService`) utilise le SDK
MinIO officiel, compatible avec tout endpoint S3.

## E-mail

Remplacer Mailhog par un fournisseur SMTP réel (ex: un service européen
conforme RGPD) en renseignant `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/
`SMTP_PASSWORD`/`SMTP_FROM`. Ne jamais utiliser Mailhog au-delà du
développement local.

## Application Flutter

- **Android** : build via `flutter build appbundle`, publication sur Google
  Play.
- **iOS** : build via `flutter build ipa`, nécessite un compte développeur
  Apple et une configuration de signature.
- **Windows/macOS/Linux** : `flutter build windows|macos|linux`, packaging
  spécifique par plateforme (MSIX, notarization Apple, AppImage/Snap).
- Configurer `API_URL` et `KEYCLOAK_DISCOVERY_URL` de production via
  `--dart-define` au moment du build (jamais codés en dur).

## Observabilité (non implémentée, recommandée)

- Centralisation des logs (l'API émet des logs structurés via le `Logger`
  NestJS).
- Alerting sur les échecs de jobs BullMQ.
- Suivi des métriques infrastructure (CPU, mémoire, latence API) séparé des
  statistiques produit (`stats` module) et des statistiques d'audience
  (Umami).

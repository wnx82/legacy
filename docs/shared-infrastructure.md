# Infrastructure partagée — PostgreSQL, PgBouncer & Garage S3

Ce document décrit le branchement de l'API Legacy sur l'infrastructure
**partagée** en production (déploiement Komodo), par opposition à la pile de
**développement** auto-portée (`infra/docker-compose.yml`) qui démarre ses
propres PostgreSQL / MinIO / Keycloak.

> ⚠️ **Statut de validation.** Le code, la configuration et cette documentation
> ont été préparés hors du serveur de déploiement. Les tests réseau (DNS/ports),
> les tests PostgreSQL via PgBouncer/direct, le smoke test S3 et l'URL publique
> des médias **doivent être rejoués sur l'hôte** — voir la section
> « Diagnostic sécurisé » et le suivi dans [`todo.md`](../todo.md).

## 1. Vue d'ensemble

| Ressource | Rôle | Accès runtime | Accès direct/externe |
|-----------|------|---------------|----------------------|
| PostgreSQL partagé | Données structurées | **PgBouncer** `pgbouncer:6432` | `pg-shared:5432` (migrations) |
| Garage S3 partagé | Fichiers & médias | `http://garage:3900` (interne) | `https://s3.ekreativ.be` (externe) |
| Médias publics | Affichage navigateur | — | `https://legacy.media.ekreativ.be` |

Réseau Docker externe : **`shared-db`** (alias `pgbouncer`, `pgbouncer-shared`,
`pg-shared`, `garage`). Garage ne nécessite pas de réseau séparé.

## 2. Secrets (jamais dans le dépôt)

Les identifiants proviennent **exclusivement** de fichiers montés sur l'hôte en
mode `600`, injectés via `env_file` (voir `infra/docker-compose.shared.yml`) :

```
/srv/shared-db/secrets/legacy.env       # DATABASE_URL, DATABASE_URL_DIRECT, PG*, PGMAXPROTOCOLVERSION
/srv/shared-media/secrets/legacy.env    # S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, PUBLIC_BASE_URL
```

Ces valeurs ne figurent **jamais** dans le dépôt, une image Docker, les logs, le
README, le CHANGELOG ou `.env.example` (placeholders uniquement). `.gitignore` et
`.dockerignore` excluent `.env`, `*.key`, `*.pem`, `secrets/`.

Komodo/Periphery doit disposer d'un accès **lecture** aux deux chemins ci-dessus
(réutiliser le bind mount déjà en place pour les autres stacks).

## 3. PostgreSQL & PgBouncer

- **Runtime applicatif** → `DATABASE_URL` (via PgBouncer, `pgbouncer:6432`).
  PgBouncer est en **transaction pooling** : ajouter `?pgbouncer=true` à l'URL
  désactive les prepared statements persistants, incompatibles avec ce mode.
- **Migrations / admin** → `DATABASE_URL_DIRECT` (PostgreSQL direct,
  `pg-shared:5432`). Prisma l'utilise via `directUrl` (voir
  `database/prisma/schema.prisma`).

Points d'attention en transaction pooling : prepared statements persistants,
variables de session, tables temporaires, advisory locks, `LISTEN/NOTIFY`,
transactions longues, imports massifs. Prisma route déjà les migrations vers la
connexion directe. La variable `PGMAXPROTOCOLVERSION=3.0` (présente dans le
fichier de secrets, nécessaire à `libpq >= 17` derrière PgBouncer) ne doit pas
être supprimée.

### Migrations

```bash
# Production : jamais migrate dev / reset. Utiliser la connexion directe.
pnpm --filter @legacy/database prisma:migrate:deploy
```

`prisma migrate deploy` s'appuie sur `directUrl` (pg-shared). Ne jamais exécuter
`prisma migrate dev` ni `prisma migrate reset` sur la base partagée.

## 4. Garage S3

Le client `minio` (déjà utilisé par `StorageService`) parle le protocole S3 en
**path-style**, obligatoire avec Garage. `StorageService` lit `S3_*` en priorité
et retombe sur `MINIO_*` en dev.

- Objets **privés** (coffre-fort documentaire) : jamais d'URL publique — accès
  par URL signée temporaire (`getPresignedDownloadUrl`) après contrôle des droits.
- Objets **publics** : `StorageService.buildPublicUrl(key)` →
  `https://legacy.media.ekreativ.be/<key>`. On stocke la **clé S3** en base
  (pas l'URL complète) pour permettre un futur changement de domaine.

## 5. Migration des médias MinIO → Garage

Script idempotent, reprenable, avec `--dry-run` :
`infra/scripts/migrate-media-to-garage.mjs`.

```bash
# Inventaire seul (aucune écriture) :
pnpm --filter @legacy/api migrate:media -- --dry-run
# Migration réelle (source jamais supprimée) :
pnpm --filter @legacy/api migrate:media
```

Source via `SRC_S3_*` (ou repli `MINIO_*`), destination via `S3_*`. Un manifeste
JSONL (`media-migration.manifest.jsonl`) permet la reprise après interruption.
Chaque objet est vérifié (taille) après copie. Aucun secret n'est journalisé.

## 6. Healthchecks

- `GET /health` — liveness (process up), sans dépendance ni secret.
- `GET /api/health/ready` — readiness : PostgreSQL (`SELECT 1`) + stockage objet
  (`bucketExists`). Le stockage est **non critique** (`degraded` si down, pas
  `error`) car seules les fonctions médias en dépendent. Aucun secret ni trace
  SQL renvoyés.

## 7. Diagnostic sécurisé (à rejouer sur l'hôte)

Depuis le conteneur `legacy-api`, sans afficher de secret :

```bash
# DNS + ports
getent hosts pgbouncer pg-shared garage
nc -z pgbouncer 6432 && nc -z pg-shared 5432 && nc -z garage 3900

# PostgreSQL via PgBouncer puis direct (résultat attendu : legacy / legacy)
psql "$DATABASE_URL"        -c "SELECT current_database(), current_user;"
psql "$DATABASE_URL_DIRECT" -c "SELECT current_database(), current_user;"

# S3 smoke test dans un préfixe technique temporaire (ne touche aucun objet existant)
#   upload → stat → list → get → delete → vérifier suppression
#   ex. clé : healthchecks/<aléatoire>.txt
```

URL publique des médias : vérifier DNS, TLS, réponse HTTP, type MIME, cache et
absence de redirection incorrecte pour un objet public de test. En cas d'échec
DNS/reverse proxy, documenter le problème sans prétendre l'avoir corrigé (accès
Cloudflare / reverse proxy hors périmètre de ce dépôt).

## 8. Retour arrière

- **Base** : `DATABASE_URL` reste compatible avec l'ancienne instance locale ;
  revenir en arrière = repointer les URLs sur l'ancien hôte. Aucune migration
  destructive n'est appliquée automatiquement. Sauvegarde préalable :
  `infra/scripts/backup.sh` (voir [`docs/backup.md`](backup.md)).
- **Médias** : la migration ne supprime jamais la source MinIO ; le rollback
  consiste à repointer `S3_*`/`MINIO_*` sur l'ancien stockage.

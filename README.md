# Legacy

> **"Préparer l'après, accompagner ceux qu'on aime."**

Legacy est une plateforme web, desktop et mobile qui aide chacun à préparer
ses informations importantes de son vivant, guide les familles dans les
démarches après un décès, et offre aux pompes funèbres un portail
professionnel moderne pour accompagner leurs clients.

**Legacy n'est pas un testament légal.** C'est un assistant d'organisation,
un coffre-fort documentaire et un outil de transmission d'informations. Voir
l'avertissement légal complet et la vision produit dans
[`docs/product.md`](docs/product.md).

---

## Statut du projet

✅ Version **1.3.0** — campagne de finalisation. Toutes les tâches de
[`todo.md`](todo.md) sont traitées : exports PDF/ZIP réels, invitations famille
par e-mail, partage sécurisé des données du défunt, workflow d'accès après décès
(`AccessGrant`), export RGPD + suppression de compte, scan antivirus des
documents, sauvegardes chiffrées, tableau de bord d'audit, durcissement sécurité
(en-têtes, anti-IDOR, anti-spam), et auth OIDC desktop de l'app Flutter.

Voir [CHANGELOG](CHANGELOG.md) pour le détail par version, le rapport
[`docs/AUDIT_FINAL.md`](docs/AUDIT_FINAL.md) pour l'audit complet et les scores,
et [`docs/roadmap.md`](docs/roadmap.md) pour ce qui reste (montée majeure des
dépendances, déploiement, e2e sur stack complète).

## Démarrage rapide

### Prérequis

- Node.js ≥ 20 et pnpm (`corepack enable`)
- Docker + Docker Compose
- Flutter SDK ≥ 3.9 (uniquement pour l'application `apps/app`)

### 1. Cloner et configurer les variables d'environnement

```bash
cp .env.example .env
cp apps/website/.env.local.example apps/website/.env.local
cp apps/web-pro/.env.local.example apps/web-pro/.env.local
cp apps/web-family/.env.local.example apps/web-family/.env.local
```

Les valeurs par défaut fonctionnent telles quelles en local. Adapter les
secrets (`JWT_SECRET`, `MINIO_SECRET_KEY`, `KEYCLOAK_CLIENT_SECRET`,
`KEYCLOAK_ADMIN_PASSWORD`…) avant tout usage au-delà du développement local.

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Démarrer l'infrastructure — **toujours avant `pnpm dev`**

```bash
pnpm infra:up
```

Démarre PostgreSQL, Redis, MinIO, Keycloak (realm `legacy` préconfiguré,
SMTP branché sur Mailhog) et Umami. Attendre ~20-30 secondes au premier
démarrage le temps que Keycloak importe le realm
(`pnpm infra:logs` pour suivre, ou `docker compose -f infra/docker-compose.yml ps`
jusqu'à ce que `postgres` affiche `healthy`).

### 4. Initialiser la base de données

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 5. Lancer les applications

```bash
pnpm dev
```

Démarre en parallèle l'API et les trois apps Next.js :

| Application | URL |
| --- | --- |
| Site public | http://localhost:3000 |
| Portail professionnel | http://localhost:3002 |
| Espace famille | http://localhost:3003 |
| API (Swagger) | http://localhost:3001/api/docs |

Pour lancer une seule app : `pnpm --filter @legacy/api dev`,
`pnpm --filter @legacy/website dev`, etc.

### 6. (Optionnel) Application Flutter

```bash
cd apps/app
flutter pub get
flutter run --dart-define=API_URL=http://localhost:3001/api \
            --dart-define=KEYCLOAK_DISCOVERY_URL=http://localhost:8080/realms/legacy/.well-known/openid-configuration
```

### Comptes et outils utiles en local

| Outil | URL | Identifiants |
| --- | --- | --- |
| Compte admin de démo (Keycloak) | via `/login` sur le site public | `admin@legacy.local` / `ChangeMe123!` (mot de passe temporaire) |
| Keycloak (admin console) | http://localhost:8080 | `admin` / valeur de `KEYCLOAK_ADMIN_PASSWORD` |
| Mailhog (e-mails de test, dont la vérification d'adresse à l'inscription) | http://localhost:8025 | — |
| MinIO console | http://localhost:9001 | valeurs de `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` |
| Adminer (PostgreSQL) | http://localhost:8082 | serveur `postgres`, utilisateur `legacy` |

Créer un compte via `/register` sur le site public déclenche un e-mail de
vérification **capturé par Mailhog** (jamais un vrai envoi en local) : ouvrir
http://localhost:8025 pour cliquer sur le lien de vérification.

### Réinitialiser complètement l'environnement local

```bash
docker compose -f infra/docker-compose.yml down -v   # efface aussi les volumes (DB, Keycloak, MinIO)
pnpm infra:up
pnpm db:migrate
pnpm db:seed
```

Le `-v` est nécessaire après toute modification de
`infra/keycloak/realm-export.json` : Keycloak n'importe le realm qu'une
seule fois par volume (stratégie `IGNORE_EXISTING`).

Voir [`docs/installation.md`](docs/installation.md) pour le guide détaillé
et la section « Problèmes fréquents » (401 systématique, connexion/inscription
qui semblent ne rien faire, erreurs Prisma, etc.).

## Documentation

La documentation complète se trouve dans [`/docs`](docs) :

- [`architecture.md`](docs/architecture.md) — architecture technique et choix documentés
- [`installation.md`](docs/installation.md) — lancement en local, pas à pas
- [`security.md`](docs/security.md) — sécurité (auth, documents, audit)
- [`rgpd.md`](docs/rgpd.md) — conformité RGPD
- [`backup.md`](docs/backup.md) — sauvegardes chiffrées et restauration
- [`AUDIT_FINAL.md`](docs/AUDIT_FINAL.md) — rapport d'audit final et scores
- [`roadmap.md`](docs/roadmap.md) — roadmap en 4 phases
- [`api.md`](docs/api.md) — API REST (voir aussi Swagger en local)
- [`product.md`](docs/product.md) — vision produit, ton, rôles, avertissement légal
- [`deployment.md`](docs/deployment.md) — déploiement au-delà du local
- [`shared-infrastructure.md`](docs/shared-infrastructure.md) — PostgreSQL/PgBouncer + Garage S3 partagés (Komodo)
- [`versioning.md`](docs/versioning.md) — règle de versioning et vérification de mise à jour

## Structure du monorepo

```
legacy/
├── apps/
│   ├── website/         Site public (Next.js) — SEO, guides, statistiques Umami
│   ├── web-pro/          Portail professionnel pompes funèbres (Next.js)
│   ├── web-family/        Espace famille web (Next.js)
│   └── app/               Application Android / iOS / Windows / macOS / Linux (Flutter)
├── api/                   API (NestJS) — auth Keycloak, modules métier, Swagger
├── packages/
│   ├── shared/             Types, DTO Zod, constantes, rôles, statuts partagés
│   └── design-system/      Tokens + composants React partagés
├── database/              Schéma Prisma, migrations, seed (checklist belge de départ)
├── infra/                 Docker Compose : PostgreSQL, Keycloak, MinIO, Redis, Umami, Mailhog
└── docs/                  Documentation fonctionnelle, technique, sécurité, RGPD, roadmap
```

## Choix techniques (résumé)

Next.js (site public, portail pro, espace famille) · Flutter (app
multiplateforme) · NestJS (API) · PostgreSQL + Prisma · Keycloak (auth,
2FA, rôles) · MinIO (documents, S3-compatible) · Redis + BullMQ (jobs
asynchrones) · Umami (statistiques d'audience RGPD-friendly) · Docker
Compose (environnement local). Détail et justification de chaque choix dans
[`docs/architecture.md`](docs/architecture.md).

## Tests

```bash
pnpm test                              # tous les workspaces
pnpm --filter @legacy/api test         # API (Jest, unitaires)
pnpm --filter @legacy/api test:e2e     # API (e2e, nécessite l'infra démarrée)
pnpm --filter @legacy/shared test      # DTO partagés (Vitest)
cd apps/app && flutter test            # app Flutter
```

## Licence

Propriétaire — voir [`LICENSE`](LICENSE).

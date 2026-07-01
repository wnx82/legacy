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

✅ MVP scaffold complet — version **1.0.0**. Toutes les briques listées dans
le cahier des charges sont en place et exécutables en local (voir
[CHANGELOG](CHANGELOG.md) pour le détail de chaque étape/version, et
[`docs/roadmap.md`](docs/roadmap.md) pour ce qui reste à finaliser avant une
mise en production réelle).

## Démarrage rapide

```bash
cp .env.example .env
cp apps/website/.env.local.example apps/website/.env.local
cp apps/web-pro/.env.local.example apps/web-pro/.env.local
cp apps/web-family/.env.local.example apps/web-family/.env.local

pnpm install
pnpm infra:up          # PostgreSQL, Keycloak, MinIO, Redis, Umami, Mailhog
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev               # API + site public + portail pro + espace famille
```

| Application | URL |
| --- | --- |
| Site public | http://localhost:3000 |
| Portail professionnel | http://localhost:3002 |
| Espace famille | http://localhost:3003 |
| API (Swagger) | http://localhost:3001/api/docs |

Voir [`docs/installation.md`](docs/installation.md) pour le guide détaillé
(comptes de test, configuration d'Umami, lancement de l'app Flutter).

## Documentation

La documentation complète se trouve dans [`/docs`](docs) :

- [`architecture.md`](docs/architecture.md) — architecture technique et choix documentés
- [`installation.md`](docs/installation.md) — lancement en local, pas à pas
- [`security.md`](docs/security.md) — sécurité (auth, documents, audit)
- [`rgpd.md`](docs/rgpd.md) — conformité RGPD
- [`roadmap.md`](docs/roadmap.md) — roadmap en 4 phases
- [`api.md`](docs/api.md) — API REST (voir aussi Swagger en local)
- [`product.md`](docs/product.md) — vision produit, ton, rôles, avertissement légal
- [`deployment.md`](docs/deployment.md) — déploiement au-delà du local

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

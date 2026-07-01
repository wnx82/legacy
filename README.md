# Legacy

> **"Préparer l'après, accompagner ceux qu'on aime."**

Legacy est une plateforme web, desktop et mobile qui aide chacun à préparer ses
informations importantes de son vivant, guide les familles dans les démarches
après un décès, et offre aux pompes funèbres un portail professionnel moderne.

**Legacy n'est pas un testament légal.** C'est un assistant d'organisation, un
coffre-fort documentaire et un outil de transmission d'informations. Voir
l'avertissement légal complet dans [`docs/product.md`](docs/product.md).

---

## Statut du projet

🚧 En construction — scaffold initial du monorepo en cours de génération,
étape par étape (voir le [CHANGELOG](CHANGELOG.md) pour le détail des versions).

## Documentation

La documentation complète se trouve dans [`/docs`](docs):

- [`architecture.md`](docs/architecture.md) — architecture technique
- [`installation.md`](docs/installation.md) — lancement en local
- [`security.md`](docs/security.md) — sécurité
- [`rgpd.md`](docs/rgpd.md) — conformité RGPD
- [`roadmap.md`](docs/roadmap.md) — roadmap produit
- [`api.md`](docs/api.md) — API REST
- [`product.md`](docs/product.md) — vision produit
- [`deployment.md`](docs/deployment.md) — déploiement

## Démarrage rapide

```bash
cp .env.example .env
pnpm install
pnpm infra:up          # PostgreSQL, Keycloak, MinIO, Redis, Umami, Mailhog
pnpm db:migrate
pnpm db:seed
pnpm dev               # API + site public + portail pro + espace famille
```

Voir [`docs/installation.md`](docs/installation.md) pour le guide détaillé.

## Structure du monorepo

```
legacy/
├── apps/
│   ├── website/       Site public (Next.js)
│   ├── web-pro/        Portail professionnel pompes funèbres (Next.js)
│   ├── web-family/      Espace famille web (Next.js)
│   └── app/             Application Android / iOS / Windows / macOS / Linux (Flutter)
├── api/                 API (NestJS)
├── packages/
│   ├── shared/           Types, DTO, validations, constantes, rôles partagés
│   └── design-system/    Design system (tokens, composants React)
├── database/            Schéma Prisma, migrations, seed
├── infra/               Docker Compose, Keycloak, PostgreSQL, MinIO, Redis
└── docs/                Documentation fonctionnelle et technique
```

## Licence

Propriétaire — voir [`LICENSE`](LICENSE).

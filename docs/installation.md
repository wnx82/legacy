# Installation locale

## Prérequis

- Node.js ≥ 20, pnpm ≥ 9 (`corepack enable` recommandé)
- Docker et Docker Compose
- Flutter SDK ≥ 3.9 (uniquement pour `apps/app`)

## 1. Cloner et installer les dépendances

```bash
git clone <url-du-depot> legacy
cd legacy
pnpm install
```

## 2. Configurer les variables d'environnement

```bash
cp .env.example .env
# Chaque app Next.js a son propre fichier d'environnement (client OIDC distinct) :
cp apps/website/.env.local.example apps/website/.env.local
cp apps/web-pro/.env.local.example apps/web-pro/.env.local
cp apps/web-family/.env.local.example apps/web-family/.env.local
```

Adapter les secrets (`JWT_SECRET`, `MINIO_SECRET_KEY`,
`KEYCLOAK_CLIENT_SECRET`, `KEYCLOAK_ADMIN_PASSWORD`) avant tout usage
au-delà du développement local. Voir la liste complète dans `.env.example`.

## 3. Démarrer l'infrastructure

```bash
pnpm infra:up
```

Démarre PostgreSQL, Redis, MinIO, Keycloak (realm `legacy` préconfiguré),
Umami et Mailhog. Attendre ~30 secondes que Keycloak importe le realm au
premier démarrage (`pnpm infra:logs` pour suivre).

Services accessibles :

| Service | URL |
| --- | --- |
| Keycloak (admin) | http://localhost:8080 |
| MinIO console | http://localhost:9001 |
| Umami | http://localhost:8081 |
| Mailhog (UI) | http://localhost:8025 |
| Adminer | http://localhost:8082 |

## 4. Initialiser la base de données

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Le seed crée : les catégories de documents, une checklist belge par défaut
(à vérifier avec des sources officielles avant production — voir
`product.md`), une organisation d'exemple et deux utilisateurs de
démonstration.

## 5. Configurer Umami (statistiques du site public)

1. Ouvrir http://localhost:8081, se connecter avec les identifiants par
   défaut (`admin` / `umami`), les changer immédiatement.
2. Créer un site pointant vers `http://localhost:3000`.
3. Copier l'ID de site généré dans `apps/website/.env.local`
   (`NEXT_PUBLIC_UMAMI_WEBSITE_ID`).

Cette étape est optionnelle : le site fonctionne sans, le script de mesure
ne se charge simplement pas tant que ces variables sont absentes.

## 6. Lancer les applications

```bash
pnpm dev
```

Lance en parallèle (via Turborepo) :

| Application | Port |
| --- | --- |
| API NestJS | http://localhost:3001 (Swagger : `/api/docs`) |
| Site public | http://localhost:3000 |
| Portail professionnel | http://localhost:3002 |
| Espace famille | http://localhost:3003 |

Ou individuellement : `pnpm --filter @legacy/api dev`, etc.

## 7. Lancer l'application Flutter

```bash
cd apps/app
flutter pub get
flutter run --dart-define=API_URL=http://localhost:3001/api \
            --dart-define=KEYCLOAK_DISCOVERY_URL=http://localhost:8080/realms/legacy/.well-known/openid-configuration
```

## Comptes de test

| Rôle | E-mail | Mot de passe |
| --- | --- | --- |
| Administrateur plateforme (Keycloak) | `admin@legacy.local` | `ChangeMe123!` (temporaire) |

Voir `infra/README.md` pour le détail des identifiants de développement.

## Tests

```bash
pnpm test              # tous les workspaces
pnpm --filter @legacy/api test        # API (Jest)
pnpm --filter @legacy/api test:e2e    # e2e API (nécessite l'infra démarrée)
pnpm --filter @legacy/shared test     # DTO (Vitest)
cd apps/app && flutter test           # app Flutter
```

## Problèmes fréquents

- **`Can't reach database server at localhost:5432`** : l'infrastructure
  Docker n'est pas démarrée (ou pas encore prête). Toujours lancer
  `pnpm infra:up` **avant** `pnpm dev`, et attendre que `docker compose -f
  infra/docker-compose.yml ps` affiche `postgres` en `healthy`.
- **Keycloak met du temps à démarrer** : `start-dev --import-realm` importe
  le realm à chaque démarrage sans volume dédié ; attendre le log
  `Keycloak ... started`.
- **Keycloak n'applique pas mes changements de `realm-export.json`** :
  l'import utilise la stratégie `IGNORE_EXISTING` — une fois le realm créé
  en base, les imports suivants sont ignorés. Pour forcer une réimportation
  propre après une modification : arrêter la stack, supprimer le volume
  `legacy_postgres_data` (ou juste la base `keycloak` :
  `docker exec legacy-postgres psql -U legacy -d legacy -c "DROP DATABASE keycloak;" && docker exec legacy-postgres psql -U legacy -d legacy -c "CREATE DATABASE keycloak;"`),
  puis redémarrer Keycloak.
- **`pnpm dev` échoue sur les apps Next.js** : vérifier que les fichiers
  `.env.local` de chaque app existent (voir étape 2).
- **Erreur Prisma "Client not generated"** : lancer `pnpm db:generate`
  après tout changement de `database/prisma/schema.prisma`.
- **`401 Unauthorized` sur toutes les routes protégées de l'API alors que
  la connexion Keycloak a réussi** : vérifier que `KEYCLOAK_PUBLIC_URL` est
  bien définie (URL vue par le navigateur, ex: `http://localhost:8080`).
  L'API valide l'émetteur (`iss`) des tokens contre cette URL, qui diffère
  de `KEYCLOAK_URL` dès que l'API atteint Keycloak via un nom d'hôte Docker
  interne (`http://keycloak:8080`) — voir `keycloak.strategy.ts`.
- **Création de compte bloquée sur « Vérifiez votre e-mail »** : en local,
  les e-mails (dont la vérification d'adresse) sont capturés par Mailhog,
  jamais réellement envoyés. Ouvrir http://localhost:8025 pour consulter
  l'e-mail de vérification et cliquer sur le lien.

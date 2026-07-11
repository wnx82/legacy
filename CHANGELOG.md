# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le
projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Ajouté

- **Flux d'invitation famille par e-mail de bout en bout**
  (`feat/family-invitations-email`, 2026-07-11, Europe/Brussels). Auparavant
  l'invitation créait un `FamilyInvite` mais n'envoyait aucun e-mail et le
  portail pro demandait de transmettre manuellement un lien `?dossier=<id>`.
  Désormais :
  - jeton d'invitation aléatoire fort (256 bits) au lieu d'un UUID exposé ;
  - e-mail d'invitation HTML (gabarit `mailer/templates.ts`, contenu échappé)
    envoyé via la file `emails` avec un lien `/invitation?token=…` ;
  - endpoints `GET /family-invites/:token` (public, infos minimales) et
    `POST /family-invites/:token/accept` (connecté) qui valident le jeton,
    marquent l'invitation `ACCEPTED` et renvoient le dossier lié ;
  - page `web-family/invitation` qui active l'accès et mémorise le dossier ;
  - le portail pro n'expose plus de lien manuel ; le token ne quitte jamais
    l'API vers le portail pro (retiré de la réponse d'invitation).
- **Rendu réel des exports PDF et ZIP** (`feat/exports-rendering`, 2026-07-11,
  Europe/Brussels). Les workers étaient des placeholders ; ils produisent
  désormais de vrais fichiers :
  - `PdfExportProcessor` charge les données (dossier vivant ou dossier décès)
    depuis Prisma, génère un PDF vectoriel avec `pdfkit` (identité, volontés,
    contacts, personnes de confiance, checklist, documents), l'upload dans
    MinIO et marque l'`ExportJob` `COMPLETED` (ou `FAILED` avec message).
  - `ZipExportProcessor` streame chaque document depuis MinIO vers une archive
    `archiver`, elle-même streamée vers un nouvel objet MinIO (gestion des
    collisions de noms).
  - `StorageService.putObject` / `getObjectStream` ajoutés.
  - Endpoint `GET /exports/:id/download` renvoyant une URL signée temporaire,
    réservé au demandeur (contrôle de propriété + statut `COMPLETED` requis).
  - Test unitaire du renderer PDF (signature `%PDF`, pagination).

### Outillage

- **Lint opérationnel sur tout le monorepo** (`chore/tooling-lint`, 2026-07-11,
  Europe/Brussels). Le gate `pnpm lint` était cassé : l'API n'avait aucune
  dépendance ESLint et les trois apps Next.js n'avaient pas de configuration,
  ce qui déclenchait un prompt interactif (et un segfault sous WSL). Ajout de :
  - ESLint + `@typescript-eslint` + `eslint-config-prettier` et
    `api/.eslintrc.json` pour l'API ;
  - `eslint-config-next` et `.eslintrc.json` (règle `react/no-unescaped-entities`
    désactivée, contenu francophone) pour `website`, `web-pro`, `web-family` ;
  - script racine `format:check` (Prettier en mode vérification).
  Résultat : `pnpm lint` passe désormais proprement (exit 0).

## [1.0.3] - 2026-07-01

### Modifié

- README racine enrichi en guide de lancement local complet et autonome :
  prérequis, étapes détaillées, tableau des comptes et outils de
  développement (Keycloak, Mailhog, MinIO, Adminer), procédure de
  réinitialisation complète de l'environnement, renvoi vers le dépannage de
  `docs/installation.md`.

## [1.0.2] - 2026-07-01

### Corrigé

Diagnostic « créer un compte et se connecter ne fonctionnent pas », reproduit
et vérifié de bout en bout avec un navigateur automatisé (Playwright) contre
la stack Docker complète. Quatre bugs réels trouvés et corrigés :

- **Site public : aucun callback OAuth** — les boutons « Se connecter » /
  « Créer mon compte » redirigeaient bien vers Keycloak (formulaire
  fonctionnel), mais après authentification l'utilisateur revenait sur
  l'accueil avec un `?code=...` jamais échangé contre un token : rien ne se
  passait. Ajout d'un flux Authorization Code + PKCE complet
  (`lib/pkce.ts`, `lib/keycloak.ts`), d'une page `/auth/callback` qui
  échange le code, et d'une page `/compte` confirmant la connexion.
- **Inscription bloquée sur « Vérifiez votre e-mail »** — le realm exigeait
  la vérification d'e-mail (`verifyEmail: true`) sans qu'aucun serveur SMTP
  ne soit configuré : l'e-mail de vérification ne partait jamais. Ajout de
  la configuration SMTP du realm pointant vers Mailhog
  (`infra/keycloak/realm-export.json`).
- **`401 Unauthorized` sur toutes les routes protégées de l'API dès qu'elle
  tourne en Docker** — bug critique et transversal (affectait le site
  public, le portail pro et l'espace famille) : l'API validait l'émetteur
  (`iss`) des tokens contre `KEYCLOAK_URL` (nom de service Docker interne,
  `http://keycloak:8080`), alors que les tokens émis par Keycloak portent
  toujours l'URL publique vue du navigateur (`http://localhost:8080`).
  Ajout de `KEYCLOAK_PUBLIC_URL`, utilisée uniquement pour la validation de
  l'émetteur, distincte de l'URL utilisée pour récupérer les clés JWKS.
- **Erreur 500 à la première connexion d'un utilisateur dont l'e-mail
  existait déjà en base** (ex: l'admin de démonstration du seed) —
  `AuthService.syncUserFromKeycloak` tentait de créer un nouvel utilisateur
  et heurtait la contrainte d'unicité sur l'e-mail. La synchronisation
  recherche désormais aussi par e-mail et rattache la fiche existante à
  l'identité Keycloak plutôt que d'échouer.

### Documentation

Ajout d'entrées de dépannage dans `docs/installation.md` (infra non
démarrée, réimport Keycloak après modification de `realm-export.json`,
401 systématique, vérification d'e-mail via Mailhog).

## [1.0.1] - 2026-07-01

### Corrigé

Première installation réelle (`pnpm install`) et exécution de bout en bout
(infra Docker complète, migrations, seed, build, tests) du scaffold généré.
Corrige les erreurs bloquantes trouvées :

- **`@legacy/shared` ne se chargeait pas au runtime dans l'API** : le
  `package.json` pointait `main`/`types` vers le code source TypeScript brut
  (`src/index.ts`), ce qui fonctionne pour les apps Next.js
  (`transpilePackages`) mais provoquait un crash Node
  (`ERR_MODULE_NOT_FOUND`) au démarrage de l'API. Ajout d'un script `build`
  (tsc), pointage vers `dist/`, et `turbo.json` (`dev` dépend maintenant de
  `^build`).
- **`api/Dockerfile`** : le contexte de build de l'image `api` dans
  `docker-compose.yml` pointait sur `api/` au lieu de la racine du monorepo,
  cassant la copie des `package.json` des autres packages. La commande de
  développement ne reconstruisait pas `@legacy/shared` après le montage du
  volume `../packages`. L'étage `production` ne préservait pas la structure
  de liens symboliques pnpm (`packages/`, `database/`).
- **Prisma + Alpine** : le moteur de requêtes par défaut suppose OpenSSL 1.1,
  absent des images Alpine récentes (OpenSSL 3), provoquant un crash au
  démarrage (`Error loading shared library libssl.so.1.1`). Ajout de
  `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` dans
  `schema.prisma`.
- **`pnpm db:migrate`/`db:seed`/`db:studio`** échouaient (« Environment
  variable not found: DATABASE_URL ») car la CLI Prisma ne lit pas le `.env`
  racine du monorepo. Ajout de `dotenv-cli` pour charger explicitement
  `../.env` dans les scripts `database/package.json`.
- **`nest build` produisait `dist/src/main.js` au lieu de `dist/main.js`**
  (fichiers de test inclus dans la compilation, faute de
  `tsconfig.build.json`), cassant `npm start` et l'image Docker de
  production. Ajout du `tsconfig.build.json` standard NestJS.
- **`infra/docker-compose.yml`** : tag d'image `minio/mc` inexistant
  (`RELEASE.2024-10-08T09-37-25Z` → `latest`) ; option d'hostname Keycloak
  dépréciée (`KC_HOSTNAME_PORT`) provoquant une erreur de démarrage,
  remplacée par le format d'URL complète attendu par Keycloak ≥ 26.
- Erreurs TypeScript dans l'API (`main.ts`, `audit-logs.service.ts`,
  `test/health.e2e-spec.ts`) : typage du CORS, valeur JSON Prisma, import
  `supertest`, dépendance `@types/compression` manquante.
- Configuration Jest de l'API : le pattern de transformation `ts-jest`
  matchait aussi les `.js` compilés de `@legacy/shared`, générant des
  avertissements bruyants — restreint aux fichiers `.ts`.
- Suppression du champ `workspaces` redondant dans le `package.json` racine
  (non utilisé par pnpm, qui lit `pnpm-workspace.yaml`).

### Validé

`pnpm install`, `pnpm typecheck`, `pnpm test` et `pnpm build` passent sans
erreur sur les 7 workspaces. Stack Docker Compose complète démarrée
(PostgreSQL, Redis, MinIO, Keycloak avec import de realm, Umami, Mailhog,
Adminer), migration + seed exécutés avec succès, API testée en local, en
conteneur de développement et en image de production contre
l'infrastructure réelle (formulaires publics, garde d'authentification,
Swagger).

## [1.0.0] - 2026-07-01

### Ajouté

- Documentation complète dans `/docs` : `architecture.md`,
  `installation.md`, `security.md`, `rgpd.md`, `roadmap.md` (4 phases),
  `api.md`, `product.md`, `deployment.md`.
- README racine finalisé (démarrage rapide, structure, choix techniques,
  tests).

Cette version marque la fin du scaffold MVP initial de Legacy : les dix
briques listées dans le cahier des charges (monorepo, infra, base de
données, package partagé, API, design system, site public, portail
professionnel, espace famille, application Flutter) sont en place,
documentées et exécutables en local. Voir `docs/roadmap.md` pour la suite.

## [0.10.0] - 2026-07-01

### Ajouté

- Application Flutter (`apps/app`), cible Android/iOS/Windows/macOS/Linux :
  onboarding, connexion/inscription (Keycloak via `flutter_appauth`),
  tableau de bord, progression du dossier vivant, documents (upload direct
  MinIO), contacts, volontés, personnes de confiance, patrimoine,
  assurances, abonnements, animaux, checklist famille, notifications,
  profil, paramètres, export PDF.
- Thème Flutter aligné sur les tokens du design system (`lib/theme.dart`).
- `flutter analyze` sans avertissement, premier test de fumée (`flutter test`).

### Ajouté (API)

- Endpoints `GET/POST /living-profile/assets`, `/insurances`,
  `/subscriptions`, `/pets` — nécessaires aux modules Patrimoine, Assurances,
  Abonnements et Animaux (Prisma les modélisait déjà, mais ils manquaient de
  l'API REST initiale).

## [0.9.0] - 2026-07-01

### Ajouté

- Espace famille Legacy (`apps/web-family`) : authentification Keycloak,
  accueil avec résumé des démarches, checklist visible par la famille,
  envoi de documents (upload direct MinIO), messages de la pompe funèbre,
  pages contacts utiles et volontés partagées, export PDF, profil invité.
- `.env.local.example` ajouté dans `apps/website`, `apps/web-pro` et
  `apps/web-family` (chaque client OpenID Connect Keycloak est propre à
  son application).

### Corrigé

- API : `GET /death-cases/:id/notes` est désormais accessible aux membres de
  la famille, filtré aux notes `FAMILY_VISIBLE` (auparavant réservé aux
  seuls professionnels, ce qui bloquait la messagerie côté espace famille).

## [0.8.0] - 2026-07-01

### Ajouté

- Portail professionnel Legacy (`apps/web-pro`) : authentification Keycloak
  SPA (`keycloak-js`, session obligatoire), tableau de bord avec
  **statistiques d'usage**, liste et création de dossiers décès, détail de
  dossier à onglets (aperçu, checklist interactive, documents, famille,
  notes internes), gestion des collaborateurs, paramètres d'organisation
  (logo/couleurs), modèles de messages, modèles de checklist, profil
  utilisateur.

## [0.7.0] - 2026-07-01

### Ajouté

- Site public Legacy (`apps/website`, Next.js App Router) : accueil complet
  (hero, pourquoi Legacy, trois publics, fonctionnalités, sécurité, comment
  ça marche, tarifs, FAQ, CTA), pages `/particuliers`, `/familles`,
  `/pompes-funebres`, `/fonctionnalites`, `/tarifs`, `/securite`,
  `/a-propos`, `/contact`, `/demo`, `/login`, `/register`,
  `/mentions-legales`, `/confidentialite`, `/conditions-utilisation`.
- Section Guides avec les 10 articles de départ (`/guides`, `/guides/[slug]`),
  articles liés aux formalités belges marqués comme à vérifier avec des
  sources officielles avant production.
- SEO : métadonnées par page, Open Graph, `sitemap.xml` et `robots.txt`
  générés dynamiquement.
- **Statistiques d'audience** via Umami (script chargé conditionnellement,
  aucune donnée personnelle, aucun cookie).
- Connexion/inscription déléguées à Keycloak (redirection OpenID Connect).
- Variables `NEXT_PUBLIC_*` ajoutées à `.env.example`.

## [0.6.0] - 2026-07-01

### Ajouté

- Package `@legacy/design-system` : tokens de couleurs/espacements/typographie
  sobres et rassurants, préréglage Tailwind partagé, composants React
  (Button, Card, Badge, Alert, ProgressBar, EmptyState, Skeleton,
  Breadcrumbs, Toast, Timeline, ChecklistItem, FileUpload, Modal, Header,
  Footer, Sidebar).

## [0.5.0] - 2026-07-01

### Ajouté

- API NestJS complète : authentification JWT Keycloak (JWKS), garde de rôles
  globale, modules organisations, dossier vivant, dossier décès, checklist,
  documents (upload/download signés MinIO), modèles de checklist,
  notifications, exports asynchrones (BullMQ), audit logs, **statistiques**
  (usage portail pro + plateforme), formulaires publics.
- Swagger / OpenAPI exposé sur `/api/docs`.
- Sécurité : Helmet, compression, CORS restreint, rate limiting
  (`@nestjs/throttler`), filtre d'exception sans fuite d'information en
  production, validation stricte des entrées (Zod via `nestjs-zod`).
- Tests unitaires (`OrganizationsService`, DTO) et premier test e2e (`/health`).
- `Dockerfile` multi-stage pour l'API (développement et production).

## [0.4.0] - 2026-07-01

### Ajouté

- Package `@legacy/shared` : rôles et statuts typés (miroir des enums
  Prisma) avec libellés français, constantes (catégories de documents,
  permissions, avertissements légaux RGPD), DTO validés avec Zod pour les
  principaux modules (organisations, dossier vivant, dossier décès,
  checklist, documents, formulaires du site public).
- Premiers tests unitaires (Vitest) sur les schémas de validation.

## [0.3.0] - 2026-07-01

### Ajouté

- Schéma Prisma complet (`database/prisma/schema.prisma`) : identité, RBAC
  (rôles/permissions), dossier vivant, dossier décès, checklist de formalités,
  documents, contacts, patrimoine, assurances, abonnements, animaux, accès
  après décès, notifications, exports, audit logs, RGPD/consentements, blog
  et guides.
- Seed de données de démonstration (`database/seed/seed.ts`) avec catégories
  de documents, checklist belge par défaut (à vérifier avant production) et
  utilisateurs/organisation d'exemple.
- Package `@legacy/database` (scripts Prisma, client partagé).

## [0.2.0] - 2026-07-01

### Ajouté

- Docker Compose complet (`infra/docker-compose.yml`) : PostgreSQL (bases
  `legacy`/`keycloak`/`umami`), Redis, MinIO (+ création automatique du
  bucket), Keycloak (realm `legacy` préconfiguré avec les 7 rôles et les
  clients OpenID Connect), Umami (statistiques RGPD-friendly), Mailhog (SMTP
  de test), Adminer.
- Script d'initialisation multi-bases PostgreSQL.
- Export de realm Keycloak (`infra/keycloak/realm-export.json`).
- Documentation `infra/README.md` expliquant les choix d'infrastructure.

## [0.1.0] - 2026-07-01

### Ajouté

- Structure initiale du monorepo (`apps/website`, `apps/web-pro`, `apps/web-family`,
  `apps/app`, `api`, `packages/shared`, `packages/design-system`, `database`, `infra`, `docs`).
- Configuration workspace pnpm + Turborepo.
- Fichier `.env.example` documentant toutes les variables d'environnement nécessaires.
- `.gitignore`, `.editorconfig`, `.nvmrc`, `LICENSE`.
- README initial et présent CHANGELOG.

[Unreleased]: https://github.com/wnx82/legacy/compare/v1.0.3...HEAD
[1.0.3]: https://github.com/wnx82/legacy/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/wnx82/legacy/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/wnx82/legacy/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/wnx82/legacy/compare/v0.10.0...v1.0.0
[0.10.0]: https://github.com/wnx82/legacy/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/wnx82/legacy/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/wnx82/legacy/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/wnx82/legacy/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/wnx82/legacy/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/wnx82/legacy/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/wnx82/legacy/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/wnx82/legacy/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/wnx82/legacy/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/wnx82/legacy/releases/tag/v0.1.0

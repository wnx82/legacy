# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le
projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

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

[Unreleased]: https://github.com/legacy/legacy/compare/v0.9.0...HEAD
[0.9.0]: https://github.com/legacy/legacy/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/legacy/legacy/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/legacy/legacy/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/legacy/legacy/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/legacy/legacy/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/legacy/legacy/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/legacy/legacy/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/legacy/legacy/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/legacy/legacy/releases/tag/v0.1.0

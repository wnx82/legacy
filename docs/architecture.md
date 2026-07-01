# Architecture technique

## Vue d'ensemble

```
Legacy
│
├── apps/website      Site public (Next.js, App Router)
├── apps/web-pro       Portail professionnel pompes funèbres (Next.js)
├── apps/web-family     Espace famille web (Next.js)
├── apps/app             Application Android/iOS/Windows/macOS/Linux (Flutter)
│
├── api                  API (NestJS)
├── database             Schéma Prisma, migrations, seed (PostgreSQL)
├── packages/shared       Types, DTO (Zod), constantes, rôles, statuts
├── packages/design-system Tokens + composants React partagés
│
└── infra                Docker Compose : PostgreSQL, Keycloak, MinIO, Redis, Umami, Mailhog
```

Chaque flèche de dépendance va des applications vers l'API, jamais l'inverse.
Les trois apps Next.js et l'app Flutter ne communiquent **jamais** directement
avec PostgreSQL, MinIO ou Redis — uniquement via l'API NestJS (à l'exception
de l'upload/téléchargement de documents, qui utilise des URLs signées
générées par l'API mais transférées directement vers/depuis MinIO, pour ne
pas faire transiter les fichiers par le serveur applicatif).

## Choix techniques et justifications

| Domaine | Choix | Pourquoi |
| --- | --- | --- |
| Site public, portail pro, espace famille | Next.js (App Router) + TypeScript | SEO, rendu serveur, bonne DX, un seul framework pour trois surfaces différentes |
| Application personnelle | Flutter | Une base de code pour Android, iOS, Windows, macOS, Linux |
| API | NestJS + TypeScript | Architecture modulaire, DI, intégration Swagger native, aligné avec l'écosystème Node du reste du monorepo |
| Base de données | PostgreSQL | Relationnel, contraintes fortes adaptées aux rôles/permissions/dossiers, mature pour RGPD (voir `rgpd.md`) |
| ORM | Prisma | Typage bout-en-bout avec l'API, migrations versionnées, lisibilité du schéma |
| Authentification | Keycloak | Open source, gestion des rôles et 2FA natifs, réutilisable par les 4 applications via OpenID Connect |
| Stockage documentaire | MinIO (S3-compatible) | Auto-hébergeable, upload/download par URL signée, migration facile vers un object storage managé (OVH, Scaleway, AWS S3) |
| Jobs asynchrones | Redis + BullMQ | Génération PDF/ZIP, e-mails, rappels — découplés du cycle requête/réponse |
| Statistiques | Umami (site public) + module `stats` de l'API (portails) | Umami pour l'audience web (RGPD-friendly, sans cookies) ; le module `stats` de l'API pour les KPIs métier (dossiers, tâches, préparation moyenne) |
| Déploiement local | Docker Compose | Reproductible, un seul point d'entrée (`pnpm infra:up`) |

## Authentification — flux résumé

1. Chaque application (site, portail pro, espace famille, app Flutter) est un
   client OpenID Connect distinct dans le realm Keycloak `legacy` (voir
   `infra/keycloak/realm-export.json`).
2. Les apps web utilisent le flux Authorization Code + PKCE (`keycloak-js`
   pour web-pro/web-family, redirection simple pour le site public).
3. L'app Flutter utilise `flutter_appauth` (même flux, adapté mobile/desktop).
4. Chaque requête vers l'API porte le JWT Keycloak en `Authorization: Bearer`.
   `KeycloakStrategy` (`api/src/modules/auth/strategies/keycloak.strategy.ts`)
   valide la signature via les clés JWKS du realm, puis `AuthService`
   synchronise un `User` local (table `users`) à partir du `sub` du token.
5. `RolesGuard` (global) vérifie les rôles réalm du token contre les
   décorateurs `@Roles(...)` posés sur chaque route.

## Documents — flux résumé

1. Le client demande une URL d'upload : `POST /documents/upload-url` (ou les
   raccourcis `/living-profile/documents`, `/death-cases/:id/documents`).
2. L'API crée l'enregistrement `Document` en base (métadonnées) et retourne
   une URL PUT signée MinIO valable quelques minutes.
3. Le client (navigateur ou app Flutter) envoie le fichier **directement**
   à MinIO via cette URL — le fichier ne transite jamais par l'API.
4. Le téléchargement suit le même principe en sens inverse
   (`GET /documents/:id/download-url`), avec journalisation systématique
   dans `AuditLog` (`document.download`).

Choix assumé pour ce MVP : l'enregistrement `Document` est créé de façon
optimiste au moment de la demande d'URL, avant la fin réelle de l'upload.
Une réconciliation périodique (suppression des documents jamais uploadés)
est prévue en Phase 2 — voir `roadmap.md`.

## Modèle de données

Le détail des entités et relations est dans
[`database/prisma/schema.prisma`](../database/prisma/schema.prisma), avec les
choix de modélisation documentés dans [`database/README.md`](../database/README.md).

## Ce qui n'est pas encore branché (connu, documenté)

- Génération réelle des PDF/ZIP (`api/src/modules/queue/processors/*`) :
  structure de jobs en place, rendu à implémenter en Phase 1.
- Contacts/volontés du dossier vivant exposés à la famille depuis un dossier
  décès lié : nécessite un nouvel endpoint dédié (voir
  `apps/web-family/app/dossier/contacts/page.tsx`).
- Authentification OpenID Connect desktop pour l'app Flutter (Windows/macOS/
  Linux) : `flutter_appauth` fonctionne nativement sur mobile, le flux
  desktop nécessite un serveur de callback local additionnel.

# TODO

État du projet audité le 2026-07-11 à partir du code du dépôt. Il n'y avait
pas de `todo.md` local ; ce fichier sert donc de suivi opérationnel compact,
complémentaire à [`docs/roadmap.md`](docs/roadmap.md).

## À faire en priorité avant usage réel

- [x] Implémenter le rendu réel des exports PDF/ZIP. **(fait — `feat/exports-rendering`)**
  Workers réels : `pdfkit` (PDF dossier vivant / décès) et `archiver` (ZIP en
  streaming depuis MinIO), upload MinIO, statut `ExportJob` géré, endpoint de
  téléchargement signé `GET /exports/:id/download` réservé au demandeur.
  [`api/src/modules/queue/processors/pdf-export.processor.ts`](api/src/modules/queue/processors/pdf-export.processor.ts),
  [`api/src/modules/queue/processors/zip-export.processor.ts`](api/src/modules/queue/processors/zip-export.processor.ts).

- [x] Brancher un vrai flux d'invitation famille par e-mail. **(fait — `feat/family-invitations-email`)**
  E-mail HTML envoyé via la file `emails`, jeton fort, endpoints
  `GET /family-invites/:token` + `POST /family-invites/:token/accept`, page
  `web-family/invitation`. Plus de lien `?dossier=<id>` manuel.
  [`api/src/modules/death-cases/death-cases.service.ts`](api/src/modules/death-cases/death-cases.service.ts),
  [`api/src/modules/death-cases/family-invites.controller.ts`](api/src/modules/death-cases/family-invites.controller.ts),
  [`apps/web-family/app/invitation/page.tsx`](apps/web-family/app/invitation/page.tsx).

- [x] Exposer à la famille les contacts utiles et volontés partagées du
  dossier vivant lié au dossier décès. **(fait — `feat/family-data-sharing`)**
  Endpoints `GET /death-cases/:id/contacts` et `/wishes` avec contrôle d'accès
  `assertCanAccessDeathCase` (pro ou proche à invitation acceptée, anti-IDOR).
  Pages `web-family` reliées (états chargement/vide/erreur).
  [`apps/web-family/app/dossier/contacts/page.tsx`](apps/web-family/app/dossier/contacts/page.tsx),
  [`apps/web-family/app/dossier/volontes/page.tsx`](apps/web-family/app/dossier/volontes/page.tsx).

- [ ] Finaliser l'authentification OpenID Connect desktop dans l'app Flutter
  (Windows/macOS/Linux).
  Le flux mobile est en place, mais le callback local desktop n'est pas encore
  implémenté :
  [`apps/app/lib/services/auth_service.dart`](apps/app/lib/services/auth_service.dart),
  [`apps/app/README.md`](apps/app/README.md).

- [ ] Vérifier et dater les formalités belges par défaut avec des sources
  officielles.
  Le seed et les guides contiennent déjà l'avertissement disant que la
  vérification reste à faire :
  [`database/seed/seed.ts`](database/seed/seed.ts),
  [`apps/website/lib/content/guides.ts`](apps/website/lib/content/guides.ts).

## Partiellement en place, mais pas réellement terminés

- [x] `AccessGrant` : flux métier complet. **(fait — `feat/access-grants`)**
  Module `access-grants` : demande / activation / suspension / révocation,
  autorisation stricte (autorité ou personne de confiance habilitée), notif +
  audit, `GET ?livingProfileId=` et `GET /mine`.
  [`api/src/modules/access-grants/`](api/src/modules/access-grants/).

- [ ] Les `Role` / `Permission` existent au niveau modèle et constantes
  partagées, mais pas de gestion avancée visible côté produit ni de
  permissions fines appliquées partout :
  [`packages/shared/src/constants/permissions.ts`](packages/shared/src/constants/permissions.ts),
  [`database/prisma/schema.prisma`](database/prisma/schema.prisma).

- [x] Audit logs : couverture élargie + tableau de bord dédié. **(fait — `feat/audit-coverage`)**
  `GET /audit-logs/summary` (agrégats) + page « Journal d'audit » du portail pro.
  Journalisation ajoutée (notes, accès, invitations, exports, comptes, documents).
  [`apps/web-pro/app/journal/page.tsx`](apps/web-pro/app/journal/page.tsx).

- [x] Export RGPD complet + suppression de compte en cascade. **(fait — `feat/rgpd-and-account-deletion`)**
  `POST /exports/rgpd` (JSON complet via `RgpdExportProcessor`) et
  `DELETE /accounts/me` (cascade dossier vivant + purge MinIO + anonymisation).
  Action manuelle restante : désactivation Keycloak.
  [`docs/rgpd.md`](docs/rgpd.md),
  [`api/src/modules/accounts/`](api/src/modules/accounts/).

- [x] Scan antivirus des documents uploadés. **(fait — `feat/document-antivirus-scan`)**
  `POST /documents/:id/confirm` → checksum SHA-256 réel + scan clamd (INSTREAM),
  purge si infecté. Statut `Document.scanStatus`. Sans `CLAMAV_HOST` : `SKIPPED`.
  Migration `add_document_scan_status`.

- [ ] Les sauvegardes chiffrées automatisées ne sont pas présentes dans ce
  dépôt.

## Ce qui est bien déjà en place

- [x] Monorepo exécutable localement avec `website`, `web-pro`, `web-family`,
  `api`, `database`, `infra`.
- [x] Authentification Keycloak sur les apps web, avec base de rôles.
- [x] App Flutter avec les écrans principaux et auth mobile.
- [x] Dossiers décès, checklist, documents, notes/messages, statistiques et
  modèles de checklist côté API / portail pro.
- [x] Infrastructure locale Docker Compose complète avec PostgreSQL, Redis,
  MinIO, Keycloak, Umami et Mailhog.
- [x] Pipeline d'exports asynchrones déjà structuré, même si le rendu réel
  reste à brancher.

## Lecture honnête du statut

Le projet est bien un MVP/scaffold solide, pas une version réellement prête à
la production. Le plus gros écart entre "présent dans le code" et "vraiment en
place" concerne surtout les exports finaux, les invitations famille bout à
bout, le partage sécurisé des données du défunt vers la famille, et plusieurs
chantiers sécurité/RGPD encore au stade de modélisation.

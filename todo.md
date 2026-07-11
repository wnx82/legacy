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

- [ ] Exposer à la famille les contacts utiles et volontés partagées du
  dossier vivant lié au dossier décès.
  Les pages existent côté `web-family`, mais sont explicitement en attente
  d'endpoints dédiés :
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

- [ ] `AccessGrant` est modélisé en base, mais le flux métier n'existe pas
  encore réellement.
  Pas d'endpoints ni de workflow de validation/révocation observés :
  [`database/prisma/schema.prisma`](database/prisma/schema.prisma).

- [ ] Les `Role` / `Permission` existent au niveau modèle et constantes
  partagées, mais pas de gestion avancée visible côté produit ni de
  permissions fines appliquées partout :
  [`packages/shared/src/constants/permissions.ts`](packages/shared/src/constants/permissions.ts),
  [`database/prisma/schema.prisma`](database/prisma/schema.prisma).

- [ ] Les audit logs sont présents, mais la couverture n'est pas complète et
  il n'y a pas de tableau de bord d'audit dédié.
  Le service existe et certaines actions journalisent déjà :
  [`api/src/modules/audit-logs/audit-logs.service.ts`](api/src/modules/audit-logs/audit-logs.service.ts).

- [ ] L'export RGPD complet et la suppression de compte en cascade ne sont pas
  implémentés.
  Les types/enums existent, mais pas le traitement complet :
  [`docs/rgpd.md`](docs/rgpd.md),
  [`api/src/modules/exports/exports.service.ts`](api/src/modules/exports/exports.service.ts).

- [ ] Le scan antivirus des documents uploadés n'est pas présent.

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

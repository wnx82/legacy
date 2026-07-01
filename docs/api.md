# API

## Documentation interactive

Une fois l'API démarrée (`pnpm --filter @legacy/api dev`), la documentation
Swagger/OpenAPI complète et interactive est disponible sur :

```
http://localhost:3001/api/docs
```

Elle est générée automatiquement depuis les contrôleurs NestJS
(`@nestjs/swagger`) et reste donc toujours synchronisée avec le code.

## Base URL

Toutes les routes sont préfixées par `/api`, à l'exception de `/health`
(utilisée par Docker/les orchestrateurs pour les *healthchecks*).

## Authentification

Toutes les routes nécessitent un en-tête `Authorization: Bearer <token>`
(JWT Keycloak), sauf celles explicitement marquées publiques :
`/health`, `/contact`, `/demo-request`.

## Modules et endpoints principaux

| Module | Endpoints | Détails |
| --- | --- | --- |
| Auth | `GET /auth/me`, `POST /auth/logout` | Synchronise l'utilisateur local depuis le token Keycloak |
| Organisations | `GET/POST /organizations`, `GET/PATCH /organizations/:id`, `.../members`, `.../settings` | Réservé aux rôles `SUPER_ADMIN`/`FUNERAL_HOME_ADMIN` |
| Dossier vivant | `/living-profile`, `.../progress`, `.../documents`, `.../wishes`, `.../contacts`, `.../trusted-persons`, `.../assets`, `.../insurances`, `.../subscriptions`, `.../pets` | Scope toujours l'utilisateur courant (pas de paramètre d'ID) |
| Dossiers décès | `/death-cases`, `.../tasks`, `.../documents`, `.../family`, `.../notes`, `.../invitations` | Checklist générée depuis un `ChecklistTemplate` à la création |
| Documents | `POST /documents/upload-url`, `GET /documents/:id/download-url`, `GET/PATCH/DELETE /documents/:id` | URLs signées MinIO, jamais de fichier transitant par l'API |
| Checklist | `/checklist-templates` (CRUD) | Réservé aux rôles `SUPER_ADMIN`/`FUNERAL_HOME_ADMIN` |
| Exports | `POST /exports/pdf`, `POST /exports/zip`, `GET /exports/:id` | Traitement asynchrone via BullMQ |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read` | |
| Audit | `GET /audit-logs` | Réservé aux rôles `SUPER_ADMIN`/`FUNERAL_HOME_ADMIN` |
| Statistiques | `GET /organizations/:id/stats`, `GET /stats/platform`, `GET /stats/living-profiles/average-progress` | Ajouté au-delà du périmètre initial pour les tableaux de bord (portail pro + plateforme) |
| Site public | `POST /contact`, `POST /demo-request` | Routes publiques |

### Extensions par rapport au périmètre initial

Le cahier des charges listait les endpoints ci-dessus à l'exception de :

- `GET/POST /living-profile/assets`, `/insurances`, `/subscriptions`,
  `/pets` — ajoutés car les modules fonctionnels correspondants (patrimoine,
  assurances, abonnements, animaux) et leurs modèles Prisma existaient déjà,
  mais n'avaient pas d'endpoint associé dans la liste initiale.
- `GET /organizations/:id/stats`, `/stats/platform`,
  `/stats/living-profiles/average-progress` — module statistiques demandé
  en complément du périmètre initial.

## Validation

Chaque payload est validé avec un schéma Zod partagé
(`@legacy/shared`), appliqué via `nestjs-zod` (`ZodValidationPipe`). Les
mêmes schémas peuvent être réutilisés côté frontend pour valider les
formulaires avant envoi.

## Erreurs

Toutes les erreurs suivent le format `ApiErrorBody`
(`packages/shared/src/types/api.ts`) :

```json
{ "statusCode": 404, "message": "Organisation introuvable" }
```

En développement (`APP_ENV != production`), un champ `details` supplémentaire
peut contenir la stack trace — jamais en production (voir `security.md`).
